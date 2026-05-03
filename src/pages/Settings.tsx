import { useState } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'

const Settings = () => {
  const { address, isConnected, isSigner, isProposer, connect, disconnect } = useWalletStore()

  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
        <p className="text-gray-400 mb-6">Connect wallet to access settings</p>
        <button onClick={connect} className="btn-primary">
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">⚙️ Settings</h1>

      {/* Wallet Info */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-white mb-6">👛 Wallet</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address || ''}
                readOnly
                className="input-field font-mono flex-1"
              />
              <button onClick={copyAddress} className="btn-secondary">
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isSigner ? 'bg-green-500' : 'bg-gray-600'}`} />
              <span className="text-gray-300">Signer Role</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isProposer ? 'bg-blue-500' : 'bg-gray-600'}`} />
              <span className="text-gray-300">Proposer Role</span>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-white mb-6">🔑 Permissions</h2>

        <div className="space-y-4">
          <PermissionItem
            role="Signer"
            description="Can sign and approve transactions"
            hasPermission={isSigner}
            color="purple"
          />
          <PermissionItem
            role="Proposer"
            description="Can create new transaction proposals"
            hasPermission={isProposer}
            color="blue"
          />
          <PermissionItem
            role="Admin"
            description="Can manage roles and settings"
            hasPermission={false}
            color="gold"
          />
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Note: Permissions are managed by the DAO governance contract. Contact existing signers to request role changes.
        </p>
      </div>

      {/* Network */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-white mb-6">🌐 Network</h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Network</span>
            <span className="text-white">Ethereum Mainnet</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Chain ID</span>
            <span className="text-white font-mono">0x1</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">RPC URL</span>
            <span className="text-white text-sm font-mono">https://eth.llamarpc.com</span>
          </div>
        </div>
      </div>

      {/* Contract */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-white mb-6">📜 Contract</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Multi-Sig Treasury</label>
            <div className="p-3 bg-gray-800/50 rounded-lg font-mono text-sm text-white break-all">
              0x1234567890abcdef1234567890abcdef12345678
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Token (for governance)</label>
            <div className="p-3 bg-gray-800/50 rounded-lg font-mono text-sm text-white break-all">
              0xabcdef1234567890abcdef1234567890abcdef12
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-600/30 bg-red-900/10">
        <h2 className="text-xl font-bold text-red-400 mb-6">⚠️ Danger Zone</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">Disconnect Wallet</p>
              <p className="text-sm text-gray-400">Remove wallet from this session</p>
            </div>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PermissionItem = ({
  role,
  description,
  hasPermission,
  color,
}: {
  role: string
  description: string
  hasPermission: boolean
  color: string
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${
        color === 'purple' ? 'bg-purple-500' :
        color === 'blue' ? 'bg-blue-500' : 'bg-yellow-500'
      } ${!hasPermission && 'opacity-30'}`} />
      <div>
        <p className="font-semibold text-white">{role}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    <span className={`px-3 py-1 rounded-full text-sm ${
      hasPermission ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
    }`}>
      {hasPermission ? 'Active' : 'Inactive'}
    </span>
  </div>
)

export default Settings