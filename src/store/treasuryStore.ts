import { create } from 'zustand'

export interface Proposal {
  id: number
  description: string
  to: string
  value: number
  status: 'pending' | 'active' | 'passed' | 'rejected' | 'executed'
  yesVotes: number
  noVotes: number
  requiredSignatures: number
  currentSignatures: number
  votingEnds: number
  createdBy: string
  txHash?: string
}

export interface Transaction {
  id: number
  to: string
  value: number
  description: string
  signatures: string[]
  requiredSignatures: number
  currentSignatures: number
  status: 'pending' | 'signed' | 'executed' | 'cancelled'
  createdAt: number
}

interface TreasuryState {
  proposals: Proposal[]
  transactions: Transaction[]
  treasuryBalance: number
  isLoading: boolean
  error: string | null

  fetchProposals: () => Promise<void>
  fetchTransactions: () => Promise<void>
  createProposal: (to: string, value: number, description: string) => Promise<void>
  signTransaction: (txId: number) => Promise<void>
  executeTransaction: (txId: number) => Promise<void>
  castVote: (proposalId: number, vote: 'yes' | 'no') => Promise<void>
}

// 模擬數據
const mockProposals: Proposal[] = [
  {
    id: 1,
    description: '資助生態系統開發 - Q2 預算申請',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2dE12',
    value: 50,
    status: 'active',
    yesVotes: 3,
    noVotes: 1,
    requiredSignatures: 3,
    currentSignatures: 2,
    votingEnds: Date.now() + 86400000 * 3,
    createdBy: '0x1234...abcd',
  },
  {
    id: 2,
    description: '市場營銷合作夥伴費用支付',
    to: '0x5678...efgh',
    value: 25,
    status: 'pending',
    yesVotes: 0,
    noVotes: 0,
    requiredSignatures: 2,
    currentSignatures: 1,
    votingEnds: Date.now() + 86400000 * 5,
    createdBy: '0xabcd...1234',
  },
]

const mockTransactions: Transaction[] = [
  {
    id: 1,
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2dE12',
    value: 10,
    description: 'Developer reward',
    signatures: ['0xSigner1...', '0xSigner2...'],
    requiredSignatures: 3,
    currentSignatures: 2,
    status: 'pending',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 2,
    to: '0x5678...efgh',
    value: 5,
    description: 'Server fee payment',
    signatures: ['0xSigner1...', '0xSigner2...', '0xSigner3...'],
    requiredSignatures: 3,
    currentSignatures: 3,
    status: 'executed',
    createdAt: Date.now() - 172800000,
  },
]

export const useTreasuryStore = create<TreasuryState>((set, get) => ({
  proposals: mockProposals,
  transactions: mockTransactions,
  treasuryBalance: 125.5,
  isLoading: false,
  error: null,

  fetchProposals: async () => {
    set({ isLoading: true })
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 500))
    set({ proposals: mockProposals, isLoading: false })
  },

  fetchTransactions: async () => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 500))
    set({ transactions: mockTransactions, isLoading: false })
  },

  createProposal: async (to, value, description) => {
    set({ isLoading: true, error: null })
    try {
      // 模擬區塊鏈交易
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      const newProposal: Proposal = {
        id: get().proposals.length + 1,
        description,
        to,
        value,
        status: 'pending',
        yesVotes: 0,
        noVotes: 0,
        requiredSignatures: value > 100 ? 5 : value > 10 ? 3 : 2,
        currentSignatures: 0,
        votingEnds: Date.now() + 86400000 * 7,
        createdBy: '0xCurrentUser...',
        txHash: '0x' + Math.random().toString(16).slice(2),
      }
      
      set((state) => ({
        proposals: [newProposal, ...state.proposals],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: '創建提案失敗', isLoading: false })
      throw error
    }
  },

  signTransaction: async (txId) => {
    set({ isLoading: true, error: null })
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      set((state) => ({
        transactions: state.transactions.map((tx) =>
          tx.id === txId
            ? { ...tx, currentSignatures: (tx.currentSignatures || 0) + 1, signatures: [...tx.signatures, '0xCurrentSigner...'] }
            : tx
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Signature failed', isLoading: false })
      throw error
    }
  },

  executeTransaction: async (txId) => {
    set({ isLoading: true, error: null })
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      set((state) => ({
        transactions: state.transactions.map((tx) =>
          tx.id === txId ? { ...tx, status: 'executed' as const } : tx
        ),
        treasuryBalance: state.treasuryBalance - (state.transactions.find((t) => t.id === txId)?.value || 0),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: '執行失敗', isLoading: false })
      throw error
    }
  },

  castVote: async (proposalId, vote) => {
    set({ isLoading: true, error: null })
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                yesVotes: vote === 'yes' ? p.yesVotes + 1 : p.yesVotes,
                noVotes: vote === 'no' ? p.noVotes + 1 : p.noVotes,
              }
            : p
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: '投票失敗', isLoading: false })
      throw error
    }
  },
}))
