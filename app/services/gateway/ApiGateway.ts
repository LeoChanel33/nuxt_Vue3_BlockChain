export type HttpMethod = 'GET' | 'POST'

export interface ApiRequest {
  path: string
  method: HttpMethod
  query?: Record<string, string | number | boolean>
  body?: Record<string, unknown>
}

// 注入傳輸層，模組與中介站不依賴 Nuxt，也可以單獨測試。
export type ApiTransport = <T>(request: ApiRequest) => Promise<T>

export interface ApiModule<Params, Result> {
  readonly method: HttpMethod
  execute(params: Params, transport: ApiTransport): Promise<Result>
}

export interface OperationContract {
  params: unknown
  result: unknown
}

export type GatewayCall<Schema extends { [K in keyof Schema]: OperationContract }> = {
  [K in keyof Schema & string]: {
    module: K
    params: Schema[K]['params']
    // 可省略，由註冊模組決定；傳入時會檢查是否相符。
    method?: HttpMethod
  }
}[keyof Schema & string]

export class ApiGateway<Schema extends { [K in keyof Schema]: OperationContract }> {
  private readonly modules = new Map<string, unknown>()

  constructor(private readonly transport: ApiTransport) {}

  register<K extends keyof Schema & string>(
    name: K,
    module: ApiModule<Schema[K]['params'], Schema[K]['result']>,
  ): this {
    if (this.modules.has(name)) {
      throw new Error(`模組已註冊：${name}`)
    }
    this.modules.set(name, module)
    return this
  }

  async call<C extends GatewayCall<Schema>>(request: C): Promise<Schema[C['module']]['result']> {
    // register 已保證名稱與型別配對；異質 Map 的型別還原集中在這裡。
    const module = this.modules.get(request.module) as
      ApiModule<Schema[C['module']]['params'], Schema[C['module']]['result']> | undefined

    if (!module) {
      throw new Error(`尚未註冊模組：${request.module}`)
    }
    if (request.method !== undefined && request.method !== module.method) {
      throw new Error(`模組 ${request.module} 僅接受 ${module.method}`)
    }

    return module.execute(request.params, this.transport)
  }
}
