import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import test from 'node:test'

test('正式建置的示範頁及 API 可正常執行，並拒絕無效參數', { timeout: 20000 }, async () => {
  // 使用空閒埠，避免影響正在執行的開發伺服器。
  const socket = createServer()
  socket.listen(0, '127.0.0.1')
  await once(socket, 'listening')
  const port = socket.address().port
  await new Promise((resolve) => socket.close(resolve))

  const server = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, NITRO_PORT: String(port), NITRO_HOST: '127.0.0.1' },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  server.stdout.on('data', (chunk) => { output += chunk })
  server.stderr.on('data', (chunk) => { output += chunk })
  const base = `http://127.0.0.1:${port}`
  const sender = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  try {
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error(output)
      try {
        const response = await fetch(`${base}/api/demo/blocks?blockNumber=latest`)
        if (response.ok) { ready = true; break }
      } catch { /* 等待伺服器啟動 */ }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    assert.ok(ready, output || 'Server failed to start')
    const page = await fetch(`${base}/gatewayDemo`)
    assert.equal(page.status, 200)
    assert.match(await page.text(), /區塊鏈模組中介站範例/)

    const user = await fetch(`${base}/api/demo/users?address=${sender}`)
    assert.equal(user.status, 200)
    assert.equal((await user.json()).address, sender)

    const block = await fetch(`${base}/api/demo/blocks?blockNumber=0`)
    assert.equal(block.status, 200)
    assert.equal((await block.json()).number, 0)

    const transfer = await fetch(`${base}/api/demo/transfers`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sender, receiver: sender, amount: 1 }),
    })
    assert.equal(transfer.status, 200)
    assert.match((await transfer.json()).transactionHash, /^0x[a-f0-9]{64}$/)

    for (const query of ['-1', '1.5', '', '9007199254740992', 'latest&blockNumber=1']) {
      assert.equal((await fetch(`${base}/api/demo/blocks?blockNumber=${query}`)).status, 400)
    }
    assert.equal((await fetch(`${base}/api/demo/users?address=invalid`)).status, 400)
    const invalidTransfer = await fetch(`${base}/api/demo/transfers`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sender, receiver: sender, amount: 0 }),
    })
    assert.equal(invalidTransfer.status, 400)
  } finally {
    const exited = once(server, 'exit')
    server.kill()
    if (server.exitCode === null) await exited
  }
})
