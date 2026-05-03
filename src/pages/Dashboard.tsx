import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore'
import { useTreasuryStore } from '../store/treasuryStore'

const StatusBadge = ({
  status,
  signatures,
  required,
}: {
  status: string
  signatures: number
  required: number
}) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', label: `Pending (${signatures}/${required})` },
    signed: { bg: 'bg-blue-600/20', text: 'text-blue-400', label: 'Signed' },
    executed: { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Executed' },
    cancelled: { bg: 'bg-red-600/20', text: 'text-red-400', label: 'Cancelled' },
  }

  const c = config[status] || config.pending

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: string
  color: string
}) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </div>
)

const QuickAction = ({
  icon,
  title,
  desc,
  link,
}: {
  icon: string
  title: string
  desc: string
  link: string
}) => (
  <Link
    to={link}
    className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors group"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{desc}</p>
  </Link>
)

const Dashboard = () => {
  const { isConnected, connect } = useWalletStore()
  const { proposals, transactions, treasuryBalance, fetchProposals, fetchTransactions } = useTreasuryStore()

  useEffect(() => {
    fetchProposals()
    fetchTransactions()
  }, [])

  const activeProposals = proposals.filter((p) => p.status === 'active').length
  const pendingTxs = transactions.filter((t) => t.status === 'pending').length
  const recentActivity = transactions.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            DAO Multi-Sig Treasury
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Secure decentralized fund management,
          <br />
          multi-signature protection for treasury safety
        </p>
      </div>

      {/* Connect Wallet Prompt */}
      {!isConnected && (
        <div className="card text-center py-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-gray-400 mb-6">Connect MetaMask to participate in DAO governance</p>
          <button onClick={connect} className="btn-primary text-lg px-8 py-4">
            Connect Wallet
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {isConnected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Treasury" value={`${treasuryBalance} ETH`} icon="💰" color="from-green-500 to-emerald-500" />
            <StatCard label="Active" value={activeProposals} icon="📋" color="from-purple-500 to-pink-500" />
            <StatCard label="Pending" value={pendingTxs} icon="✍️" color="from-orange-500 to-yellow-500" />
            <StatCard label="Total" value={proposals.length} icon="🗳️" color="from-blue-500 to-cyan-500" />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickAction icon="📝" title="Create Proposal" desc="Submit new funding proposal" link="/proposals" />
              <QuickAction icon="💰" title="Treasury" desc="View and manage funds" link="/treasury" />
              <QuickAction icon="🗳️" title="Voting" desc="Participate in voting" link="/voting" />
              <QuickAction icon="⚙️" title="Settings" desc="Manage wallet and roles" link="/settings" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📈</span> Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">💸</div>
                    <div>
                      <p className="font-semibold text-white">{tx.description}</p>
                      <p className="text-sm text-gray-400">To: {tx.to} • {tx.value} ETH</p>
                    </div>
                  </div>
                  <StatusBadge status={tx.status} signatures={tx.signatures.length} required={tx.requiredSignatures} />
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🔄</span> Multi-Sig Mechanism
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 flex items-center justify-center text-3xl mx-auto mb-4">📝</div>
                <h3 className="font-bold text-white mb-2">1. Create Proposal</h3>
                <p className="text-sm text-gray-400">Proposer submits funding proposal with amount and description</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-600/30 flex items-center justify-center text-3xl mx-auto mb-4">🗳️</div>
                <h3 className="font-bold text-white mb-2">2. Vote</h3>
                <p className="text-sm text-gray-400">Signers vote, reaching threshold enters signing phase</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-600/30 flex items-center justify-center text-3xl mx-auto mb-4">✍️</div>
                <h3 className="font-bold text-white mb-2">3. Multi-Sign</h3>
                <p className="text-sm text-gray-400">Execute transfer after sufficient signatures</p>
              </div>
            </div>

            {/* Threshold Info */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
              <h3 className="font-bold text-white mb-3">📊 Signature Thresholds</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">💧</span>
                  <span className="text-gray-300">Low (&lt;10 ETH):</span>
                  <span className="text-white font-bold">2 of N</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span className="text-gray-300">Medium (10-100 ETH):</span>
                  <span className="text-white font-bold">3 of N</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">🚨</span>
                  <span className="text-gray-300">High (&gt;100 ETH):</span>
                  <span className="text-white font-bold">5 of N</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard