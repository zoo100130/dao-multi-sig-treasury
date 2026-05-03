import { create } from 'zustand'

interface Proposal {
  id: number
  txId: number
  description: string
  votingEnds: number
  yesVotes: number
  noVotes: number
  executed: boolean
  target?: string
  value?: string
}

interface ContractState {
  proposals: Proposal[]
  treasuryBalance: string
  isLoading: boolean
  error: string | null
  
  fetchProposals: () => Promise<void>
  createProposal: (to: string, value: string, description: string) => Promise<string>
  signTransaction: (txId: number) => Promise<void>
  castVote: (proposalId: number, vote: number) => Promise<void>
  executeTransaction: (txId: number) => Promise<void>
  fetchTreasuryBalance: () => Promise<void>
}

export const useContractStore = create<ContractState>((set) => ({
  proposals: [],
  treasuryBalance: '0',
  isLoading: false,
  error: null,

  fetchProposals: async () => {
    set({ isLoading: true })
    
    // 模擬數據
    const mockProposals: Proposal[] = [
      {
        id: 1,
        txId: 1,
        description: '資助開發團隊 Q2 季度預算 - 50,000 USDC',
        votingEnds: Date.now() / 1000 + 86400 * 3,
        yesVotes: 4,
        noVotes: 1,
        executed: false,
        target: '0x742d35Cc6634C0532925a3b844Bc9e7595f2dE12',
        value: '50000',
      },
      {
        id: 2,
        txId: 2,
        description: '行銷預算批准 - Twitter Space 活動費用 2,000 USDC',
        votingEnds: Date.now() / 1000 + 86400 * 5,
        yesVotes: 3,
        noVotes: 0,
        executed: false,
        target: '0x1234...abcd',
        value: '2000',
      },
      {
        id: 3,
        txId: 3,
        description: '投資新項目 - DeFi 收益策略 100,000 USDC',
        votingEnds: Date.now() / 1000 - 86400,
        yesVotes: 5,
        noVotes: 2,
        executed: true,
        target: '0x5678...efgh',
        value: '100000',
      },
    ]
    
    set({ proposals: mockProposals, isLoading: false })
  },

  createProposal: async (to, value, description) => {
    set({ isLoading: true, error: null })
    
    // 模擬創建提案
    const newId = Date.now()
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    set(state => ({
      proposals: [...state.proposals, {
        id: newId,
        txId: newId,
        description,
        votingEnds: Date.now() / 1000 + 86400 * 7,
        yesVotes: 0,
        noVotes: 0,
        executed: false,
        target: to,
        value,
      }]
    }))
    
    set({ isLoading: false })
    return newId.toString()
  },

  signTransaction: async (_txId) => {
    set({ isLoading: true, error: null })
    await new Promise(resolve => setTimeout(resolve, 1000))
    set({ isLoading: false })
  },

  castVote: async (proposalId, vote) => {
    set({ isLoading: true, error: null })
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    set(state => ({
      proposals: state.proposals.map(p => 
        p.id === proposalId 
          ? { ...p, yesVotes: vote === 1 ? p.yesVotes + 1 : p.yesVotes, noVotes: vote === -1 ? p.noVotes + 1 : p.noVotes }
          : p
      )
    }))
    
    set({ isLoading: false })
  },

  executeTransaction: async (txId) => {
    set({ isLoading: true, error: null })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    set(state => ({
      proposals: state.proposals.map(p => 
        p.txId === txId ? { ...p, executed: true } : p
      )
    }))
    
    set({ isLoading: false })
  },

  fetchTreasuryBalance: async () => {
    // 模擬國庫餘額
    set({ treasuryBalance: '1,250,000.00 USDC' })
  },
}))
