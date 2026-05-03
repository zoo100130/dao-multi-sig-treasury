import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'
import { useContractStore } from '../store/contractStore'

const CreateProposal = () => {
  const navigate = useNavigate()
  const { isConnected, isProposer } = useWalletStore()
  const { createProposal, isLoading } = useContractStore()

  const [formData, setFormData] = useState({
    target: '',
    value: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error('請先連接錢包')
      return
    }

    if (!isProposer) {
      toast.error('您沒有提案權限')
      return
    }

    try {
      const proposalId = await createProposal(
        formData.target,
        formData.value,
        formData.description
      )

      toast.success(`提案創建成功！ID: #${proposalId}`)
      setTimeout(() => navigate(`/voting/${proposalId}`), 2000)
    } catch (err) {
      toast.error('創建失敗，請重試')
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-4">需要連接錢包</h2>
        <p className="text-gray-400">請先連接 MetaMask 錢包才能創建提案</p>
      </div>
    )
  }

  if (!isProposer) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-white mb-4">無提案權限</h2>
        <p className="text-gray-400">您的錢包地址沒有提案創建權限</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        ✨ 創建資金動用提案
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Target Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            目標地址 *
          </label>
          <input
            type="text"
            required
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
            placeholder="0x..."
            className="input-field font-mono"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            金額 (USDC) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            required
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="0"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            提案說明 *
          </label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="詳細說明資金用途、預期效益等..."
            className="input-field resize-none"
          />
        </div>

        {/* Threshold Info */}
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-xl p-4">
          <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span> 審批門檻
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• &lt; $10,000 需要 2 個簽名</li>
            <li>• $10,000 - $100,000 需要 3 個簽名</li>
            <li>• &gt; $100,000 需要 5 個簽名</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            提案創建後將進入 7 天投票期
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              創建中...
            </span>
          ) : (
            '✨ 創建提案'
          )}
        </button>
      </form>
    </div>
  )
}

export default CreateProposal
