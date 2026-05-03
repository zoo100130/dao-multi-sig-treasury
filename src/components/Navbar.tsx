import { Link, useLocation } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore'

const Navbar = () => {
  const { address, balance, isConnected, connect, disconnect } = useWalletStore()
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首頁', icon: '🏠' },
    { path: '/proposals', label: '提案', icon: '📋' },
    { path: '/treasury', label: '資金庫', icon: '💰' },
    { path: '/voting', label: '投票', icon: '🗳️' },
    { path: '/settings', label: '設置', icon: '⚙️' },
  ]

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DAO Treasury
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  location.pathname === item.path
                    ? 'bg-purple-600/30 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <div className="hidden sm:block text-right">
                  <div className="text-sm text-gray-400">資金庫餘額</div>
                  <div className="font-semibold text-green-400">
                    {balance} ETH
                  </div>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
                  <span className="text-gray-400">👛</span>
                  <span className="ml-2 font-mono text-white">
                    {formatAddress(address!)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl border border-red-600/30 hover:bg-red-600/30 transition-all"
                >
                  斷開
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                className="btn-primary flex items-center gap-2"
              >
                <span>👛</span>
                <span>連接錢包</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-800">
        <div className="flex overflow-x-auto py-2 px-4 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm flex items-center gap-1 ${
                location.pathname === item.path
                  ? 'bg-purple-600/30 text-purple-400'
                  : 'text-gray-400'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
