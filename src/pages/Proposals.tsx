import { useState } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'
import { useTreasuryStore } from '../store/treasuryStore'

const Proposals = () => {
  const { isConnected } = useWalletStore()
  const { proposals, createProposal, isLoading } = useTreasuryStore()

  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    to: '',
    value: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error('Please connect wallet first')
      return
    }

    try {
      await createProposal(formData.to, parseFloat(formData.value), formData.description)
      toast.success('Proposal created successfully!')
      setShowCreate(false)
      setFormData({ to: '', value: '', description: '' })
    } catch {
      toast.error('Failed to create proposal')
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
        <p className="text-gray-400">Please connect your wallet to create proposals</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">📋 Proposals</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary"
        >
          {showCreate ? 'Cancel' : '+ New Proposal'}
        </button>
      </div>

      {/* Create Proposal Form */}
      {showCreate && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Create New Proposal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Address *
              </label>
              <input
                type="text"
                required
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="0x..."
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (ETH) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="0.00"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required signatures: {parseFloat(formData.value) > 100 ? '5' : parseFloat(formData.value) > 10 ? '3' : '2'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this proposal..."
                className="input-field resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Creating...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="card hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">#{proposal.id}</h3>
                  <StatusBadge status={proposal.status} />
                </div>
                <p className="text-gray-300">{proposal.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{proposal.value} ETH</p>
                <p className="text-sm text-gray-500">Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-xl mb-4">
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm font-mono text-white">{proposal.to.slice(0, 10)}...</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Votes</p>
                <p className="text-sm text-white">
                  <span className="text-green-400">{proposal.yesVotes}</span> /{' '}
                  <span className="text-red-400">{proposal.noVotes}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Signatures</p>
                <p className="text-sm text-white">
                  {proposal.currentSignatures}/{proposal.requiredSignatures}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Voting Ends</p>
                <p className="text-sm text-white">
                  {new Date(proposal.votingEnds).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Approval Progress</span>
                <span className="text-white">
                  {Math.round((proposal.yesVotes / (proposal.yesVotes + proposal.noVotes + 1)) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${Math.round((proposal.yesVotes / (proposal.yesVotes + proposal.noVotes + 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm">
                👍 Vote Yes
              </button>
              <button className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
                👎 Vote No
              </button>
              <button className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm">
                ✍️ Sign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', label: 'Pending' },
    active: { bg: 'bg-blue-600/20', text: 'text-blue-400', label: 'Active' },
    passed: { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Passed' },
    rejected: { bg: 'bg-red-600/20', text: 'text-red-400', label: 'Rejected' },
    executed: { bg: 'bg-purple-600/20', text: 'text-purple-400', label: 'Executed' },
  }

  const c = config[status] || config.pending

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export default Proposals