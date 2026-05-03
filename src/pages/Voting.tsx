import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'
import { useTreasuryStore } from '../store/treasuryStore'

const Voting = () => {
  const { isConnected } = useWalletStore()
  const { proposals, fetchProposals, castVote, isLoading } = useTreasuryStore()
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('active')

  useEffect(() => {
    fetchProposals()
  }, [])

  const handleVote = async (proposalId: number, vote: 'yes' | 'no') => {
    try {
      await castVote(proposalId, vote)
      toast.success(`Voted ${vote}!`)
    } catch {
      toast.error('Failed to cast vote')
    }
  }

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'active') return p.status === 'active' || p.status === 'pending'
    if (filter === 'pending') return p.status === 'pending'
    return true
  })

  if (!isConnected) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
        <p className="text-gray-400">Please connect wallet to vote</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">🗳️ Voting</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['active', 'pending', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center py-4">
          <p className="text-3xl font-bold text-green-400">
            {proposals.filter((p) => p.yesVotes > p.noVotes).length}
          </p>
          <p className="text-sm text-gray-400">Passed</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-3xl font-bold text-blue-400">
            {proposals.filter((p) => p.status === 'active').length}
          </p>
          <p className="text-sm text-gray-400">Active</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-3xl font-bold text-red-400">
            {proposals.filter((p) => p.noVotes > p.yesVotes && p.status === 'executed').length}
          </p>
          <p className="text-sm text-gray-400">Rejected</p>
        </div>
      </div>

      {/* Proposals */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const totalVotes = proposal.yesVotes + proposal.noVotes
          const yesPercent = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 50
          const noPercent = 100 - yesPercent

          return (
            <div key={proposal.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-white">#{proposal.id}</span>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <p className="text-gray-300">{proposal.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{proposal.value} ETH</p>
                  <p className="text-sm text-gray-500">Amount</p>
                </div>
              </div>

              {/* Recipient */}
              <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Recipient</p>
                <p className="text-sm font-mono text-white">{proposal.to}</p>
              </div>

              {/* Vote Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-400">✓ {proposal.yesVotes} Yes ({yesPercent.toFixed(0)}%)</span>
                  <span className="text-red-400">✗ {proposal.noVotes} No ({noPercent.toFixed(0)}%)</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${yesPercent}%` }} />
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${noPercent}%` }} />
                </div>
              </div>

              {/* Vote Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-500">Required Signatures</p>
                  <p className="text-white font-semibold">{proposal.requiredSignatures}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-500">Voting Deadline</p>
                  <p className="text-white font-semibold">{new Date(proposal.votingEnds).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              {(proposal.status === 'active' || proposal.status === 'pending') && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(proposal.id, 'yes')}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors font-semibold"
                  >
                    👍 Vote Yes
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'no')}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors font-semibold"
                  >
                    👎 Vote No
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {filteredProposals.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400">No proposals found</p>
          </div>
        )}
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

export default Voting