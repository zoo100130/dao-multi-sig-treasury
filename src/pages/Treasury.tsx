import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'
import { useTreasuryStore } from '../store/treasuryStore'

const Treasury = () => {
  const { isConnected } = useWalletStore()
  const { transactions, treasuryBalance, fetchTransactions, signTransaction, executeTransaction, isLoading } = useTreasuryStore()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSign = async (txId: number) => {
    try {
      await signTransaction(txId)
      toast.success('Transaction signed!')
    } catch {
      toast.error('Failed to sign')
    }
  }

  const handleExecute = async (txId: number) => {
    try {
      await executeTransaction(txId)
      toast.success('Transaction executed!')
    } catch {
      toast.error('Failed to execute')
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
        <p className="text-gray-400">Please connect wallet to view treasury</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">💰 Treasury</h1>

      {/* Balance Card */}
      <div className="card mb-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-600/30">
        <div className="text-center py-6">
          <p className="text-gray-400 mb-2">Total Treasury Balance</p>
          <p className="text-5xl font-bold text-green-400 mb-4">{treasuryBalance} ETH</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-gray-400">≈ ${treasuryBalance * 3500} USD</span>
            <span className="text-green-400">↑ 2.5% this month</span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📜</span> Transactions
        </h2>

        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 bg-gray-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.status === 'executed' ? 'bg-green-600/20' :
                    tx.status === 'pending' ? 'bg-yellow-600/20' : 'bg-gray-600/20'
                  }`}>
                    {tx.status === 'executed' ? '✅' : tx.status === 'pending' ? '⏳' : '❌'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{tx.description}</p>
                    <p className="text-sm text-gray-400 font-mono">{tx.to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">{tx.value} ETH</p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Signature Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Signatures</span>
                  <span className="text-white">{tx.signatures.length} / {tx.requiredSignatures}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${(tx.signatures.length / tx.requiredSignatures) * 100}%` }}
                  />
                </div>
              </div>

              {/* Signers */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-400">Signers:</span>
                {tx.signatures.map((signer, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-white font-mono">
                    {signer.slice(0, 8)}...
                  </span>
                ))}
                {tx.signatures.length < tx.requiredSignatures && (
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">
                    +{tx.requiredSignatures - tx.signatures.length} needed
                  </span>
                )}
              </div>

              {/* Actions */}
              {tx.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSign(tx.id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                  >
                    ✍️ Sign
                  </button>
                  {tx.signatures.length >= tx.requiredSignatures && (
                    <button
                      onClick={() => handleExecute(tx.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                    >
                      🚀 Execute
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 card bg-blue-900/20 border-blue-600/30">
        <h3 className="font-bold text-white mb-4">📖 How Multi-Sig Works</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Any signer can create a transaction proposal</li>
          <li>• Transactions require multiple signers to approve</li>
          <li>• Once enough signatures are collected, transaction auto-executes</li>
          <li>• Higher value transactions require more signatures for security</li>
        </ul>
      </div>
    </div>
  )
}

export default Treasury