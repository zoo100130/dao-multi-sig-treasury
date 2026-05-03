import { create } from 'zustand'
import { ethers } from 'ethers'

interface WalletState {
  address: string | null
  chainId: number | null
  balance: string
  isConnected: boolean
  isSigner: boolean
  isProposer: boolean
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  
  connect: () => Promise<void>
  disconnect: () => void
  updateBalance: () => Promise<void>
  checkRoles: () => Promise<void>
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    }
  }
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  chainId: null,
  balance: '0',
  isConnected: false,
  isSigner: false,
  isProposer: false,
  provider: null,
  signer: null,

  connect: async () => {
    try {
      if (!window.ethereum) {
        alert('請先安裝 MetaMask 錢包！')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      
      const balance = await provider.getBalance(address)
      const formattedBalance = ethers.formatEther(balance)

      set({
        address,
        chainId: Number(network.chainId),
        balance: formattedBalance,
        isConnected: true,
        provider,
        signer,
      })

      // 監聽帳戶變化
      window.ethereum.on('accountsChanged', (accounts: unknown) => {
        const accountsArray = accounts as string[]
        if (accountsArray.length === 0) {
          get().disconnect()
        } else {
          set({ address: accountsArray[0] })
          get().updateBalance()
        }
      })

      // 監聽網路變化
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })

      // 檢查角色
      get().checkRoles()

    } catch (error) {
      console.error('連接錢包失敗:', error)
      alert('連接錢包失敗，請確認 MetaMask 已解鎖')
    }
  },

  disconnect: () => {
    set({
      address: null,
      chainId: null,
      balance: '0',
      isConnected: false,
      isSigner: false,
      isProposer: false,
      provider: null,
      signer: null,
    })
  },

  updateBalance: async () => {
    const { provider, address } = get()
    if (provider && address) {
      try {
        const balance = await provider.getBalance(address)
        set({ balance: ethers.formatEther(balance) })
      } catch (error) {
        console.error('更新餘額失敗:', error)
      }
    }
  },

  checkRoles: async () => {
    // 模擬角色檢查 - 實際需要調用合約
    const { address } = get()
    if (address) {
      // 這裡應該調用合約檢查角色
      set({ isSigner: true, isProposer: true })
    }
  },
}))
