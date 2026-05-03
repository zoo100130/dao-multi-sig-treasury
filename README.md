# 02_dao_multi_sig - DAO Multi-Sig Treasury

## 專案概述
安全的去中心化資金管理系統，透過多簽機制保障資金安全。

## 技術棧
- **前端**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **後端**: Go + Gin
- **智能合約**: Solidity 0.8.20 + OpenZeppelin

## 專案結構
```
02_dao_multi_sig/
├── src/                    # React 前端源碼
│   ├── pages/             # Dashboard, Proposals, Treasury, Voting, Settings
│   ├── store/             # walletStore, treasuryStore, contractStore (Zustand)
│   ├── App.tsx            # 主應用組件
│   ├── main.tsx           # 入口點
│   └── index.css          # 全域樣式 + Tailwind
├── backend/               # Go 後端 API
│   ├── main.go            # 主程式
│   ├── config/            # 配置
│   ├── handlers/          # HTTP 處理器
│   ├── models/           # 數據模型
│   ├── services/          # 業務邏輯
│   ├── go.mod/go.sum     # Go 依賴
│   └── server.exe        # 編譯後的可執行檔 (30MB)
├── contracts/             # Solidity 智能合約
│   ├── contracts/
│   │   └── MultiSigTreasury.sol    # 多簽資金庫合約
│   ├── artifacts/
│   │   └── MultiSigTreasury.json   # 合約 ABI
│   ├── scripts/
│   │   └── compile.cjs             # 編譯腳本
│   └── hardhat.config.js
├── node_modules/          # 前端依賴
├── index.html             # HTML 入口
├── package.json           # 前端依賴
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
└── README.md
```

## 功能特性
- ✅ 錢包連接 (MetaMask)
- ✅ 提案系統 (創建、投票、狀態追蹤)
- ✅ 資金庫儀表板 (餘額顯示、交易歷史)
- ✅ 多簽投票機制 (Yes/No 投票)
- ✅ 交易簽署與執行
- ✅ 簽名門檻 (按金額自動調整: 2/3/5)

## 簽名門檻規則
| 金額範圍 | 所需簽名數 |
|---------|----------|
| < 10 ETH | 2 簽 |
| 10-100 ETH | 3 簽 |
| > 100 ETH | 5 簽 |

## 智能合約功能
- `proposeTransaction()` - 創建交易提案
- `signTransaction()` - 簽署交易
- `castVote()` - 投票
- `executeTransaction()` - 執行已通過的交易
- `getThreshold()` - 根據金額獲取門檻

## 啟動方式

### 前端
```bash
npm install
npm run dev
# 訪問 http://localhost:5173
```

### 後端
```bash
cd backend
go build -o server.exe .
./server.exe
# 啟動在 http://localhost:8080
```

### 合約編譯
```bash
cd contracts
node scripts/compile.cjs
# 生成 artifacts/MultiSigTreasury.json
```

## 依賴版本
- Node.js: v24.15.0
- Go: 1.26.1
- React: 18.x
- Tailwind CSS: 3.x
- OpenZeppelin: 4.9.3
