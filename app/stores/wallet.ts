import { defineStore } from "pinia";

export interface Company {
  id: string;
  name: string;
}

export interface VipAddress {
  name: string;
  address: string;
  account: string;
  email: string;
  phone: string;
  physicalAddress: string;
}

export interface VipAccount {
  id: string;
  companyId: string;
  name: string;
  accounts: VipAddress[];
}

export interface AgreedAccount {
  name: string;
  address: string;
  account: string;
  email: string;
  phone: string;
  physicalAddress: string;
}

// stores/wallet.ts
export const useWalletStore = defineStore('wallet', {
  // state 就像是 Vue 的 data
  state: () => ({
    walletAddress: '4564',
    balance: 0,
    isConnected: false,
    userInfo: {
      account: 'admin_user_001',
      phone: '0912-345-678',
      email: 'user.crypto@blockchain.com',
      address: '台北市信義區區塊鏈大道 1 號',
      password: 'password123'
    },
    // 特約合作公司清單與群組清單
    companies: [
      { id: 'comp_tech_vision', name: 'TechVision 科技集團' },
      { id: 'comp_global_link', name: 'GlobalLink 跨境物流' }
    ] as Company[],
    vipAccounts: [
      {
        id: 'vip_1',
        companyId: 'comp_tech_vision',
        name: '主要結算特約帳號',
        accounts: [
          { 
            name: '主要結算帳戶 (Primary)', 
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            account: 'primary_acc_01',
            email: 'primary@techvision.com',
            phone: '0911-111-111',
            physicalAddress: '台北市信義區科技大道 1 號'
          }
        ]
      },
      {
        id: 'vip_2',
        companyId: 'comp_global_link',
        name: '物流應急特約帳號',
        accounts: [
          { 
            name: '應急儲備帳戶 (Reserve)', 
            address: '0x123f681646d4a755815f9cb19e1acc8565a0c2ac',
            account: 'reserve_acc_01',
            email: 'reserve@global-link.com',
            phone: '0922-222-222',
            physicalAddress: '新北市板橋區物流路 2 號'
          }
        ]
      }
    ] as VipAccount[],
    // 約定帳戶清單
    agreedAccounts: [
      { 
        name: '預設備用冷錢包', 
        address: '0x8b323c12aa4d4a755815f9cb19e1acc8565a0c2ac',
        account: 'cold_wallet_01',
        email: 'cold@blockchain.com',
        phone: '0933-333-333',
        physicalAddress: '桃園市中壢區冷區 3 號'
      }
    ] as AgreedAccount[]
  }),
  
  // getters 就像是 Vue 的 computed
  getters: {
    shortAddress: (state) => {
      if (!state.walletAddress) return ''
      return `${state.walletAddress.slice(0, 6)}...${state.walletAddress.slice(-4)}`
    }
  },
  
  // actions 就像是 Vue 的 methods (支援非同步 async/await)
  actions: {
    async connectWallet() {
      // 模擬連線錢包的動作
      this.isConnected = true;
      this.walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      this.balance = 100.5;
    },
    disconnect() {
      this.isConnected = false;
      this.walletAddress = '';
      this.balance = 0;
    },
  }
})
