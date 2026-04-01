# RemitChain — Frontend

> React + TypeScript + Vite + Tailwind CSS frontend for the RemitChain Soroban dApp.

## Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | React 18                            |
| Language     | TypeScript 5 (strict)               |
| Build tool   | Vite 5                              |
| Styling      | Tailwind CSS 3 + custom design tokens |
| Blockchain   | `@stellar/stellar-sdk` v12          |
| Icons        | Lucide React                        |
| Animation    | Framer Motion                       |

## Project structure

```
src/
├── types/
│   └── index.ts          # All TypeScript types (RemittanceRecord, TxRecord, etc.)
├── lib/
│   ├── constants.ts      # Token metadata, contract config, helpers
│   └── contract.ts       # Typed Soroban SDK wrapper (send, claim, verify, savings)
├── context/
│   └── ToastContext.tsx  # Global toast notification state
├── hooks/
│   ├── useNetworkStats.ts  # Live ledger + XLM price ticker
│   ├── useTxHistory.ts     # Session transaction log
│   └── useSessionStats.ts  # Portfolio calculations
├── components/
│   ├── Navbar.tsx          # Navigation + wallet indicator
│   ├── Ticker.tsx          # Live stats bar
│   ├── SendForm.tsx        # Send remittance form + shared Field/Input/Button
│   ├── ClaimForm.tsx       # Claim remittance form
│   ├── VerifyForm.tsx      # On-chain verify + get record
│   ├── SavingsForm.tsx     # Withdraw savings form
│   ├── ConfirmModal.tsx    # Send confirmation modal
│   ├── RightPanel.tsx      # Stats, fee comparison, activity feed
│   └── ToastList.tsx       # Toast notification renderer
├── App.tsx                 # Root component — state + contract calls
├── main.tsx                # Entry point
└── index.css               # Tailwind + global styles
```

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set VITE_CONTRACT_ID to your deployed Soroban contract

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

## Scripts

```bash
npm run dev          # Dev server with HMR
npm run build        # Type-check + production build → dist/
npm run preview      # Preview production build locally
npm run type-check   # TypeScript check only (no emit)
npm run lint         # ESLint
```

## Connecting to your Soroban contract

1. Deploy the contract (see the smart contract README)
2. Copy the `C...` contract ID into `.env` as `VITE_CONTRACT_ID`
3. The `src/lib/contract.ts` module maps every form action to the correct
   Soroban function call via `@stellar/stellar-sdk`

## Wallet signing

For a production build, replace the simulation-only flow in
`src/lib/contract.ts` with a real wallet signer:

- **Freighter** — `@stellar/freighter-api`
- **xBull** — `@xbull-wallet/connect`
- **WalletConnect** — Stellar WalletConnect SDK

## License

MIT
