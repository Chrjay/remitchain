# RemitChain

> **Soroban-powered OFW remittance escrow with built-in micro-savings for Filipino families.**
 
---
 
## Problem
 
An OFW (Overseas Filipino Worker) in Dubai sends money home every month, but current remittance rails charge 3–8% fees, take 1–3 business days, and offer no savings mechanism — leaving families with zero financial buffer and 100% of funds consumed on arrival.
 
## Solution
 
RemitChain uses a Soroban smart contract to let OFWs lock USDC/XLM directly to a beneficiary's Stellar wallet in seconds. A configurable portion is held in on-chain micro-savings, released only after the beneficiary initiates withdrawal. No bank. No intermediary. No waiting.
 
---
 
## Suggested MVP Timeline
 
| Day | Milestone |
|-----|-----------|
| 1   | Smart contract: `send_remittance` + `claim_remittance` working on testnet |
| 2   | Frontend: Send form (amount, recipient address, savings %) + QR code for recipient |
| 3   | Claim flow + savings dashboard + testnet demo end-to-end |
 
---
 
## Stellar Features Used
 
| Feature | How it's used |
|---------|---------------|
| **Soroban smart contracts** | Core escrow, savings lock, and event emission |
| **XLM / USDC transfers** | Token movement between OFW → contract → beneficiary |
| **Trustlines** | Required for USDC or custom school tokens |
| **On-chain events** | Off-chain indexers pick up `SEND` / `CLAIM` events for push notifications |
 
---
 
## Prerequisites
 
```
rustup target add wasm32-unknown-unknown
cargo install --locked soroban-cli@21.0.0   # Match SDK version
```
 
- Rust 1.74+  
- Soroban CLI 21.x  
- Node 18+ (for optional frontend)
 
---
 
## Build
 
```bash
# Build optimised Wasm binary
soroban contract build
 
# Output: target/wasm32-unknown-unknown/release/remitchain.wasm
```
 
---
 
## Test
 
```bash
# Run all 3 unit tests
cargo test
 
# With output
cargo test -- --nocapture
```
 
---
 
## Deploy to Testnet
 
```bash
# 1. Fund a testnet account (get keys from friendbot)
soroban keys generate --global deployer --network testnet
 
# 2. Deploy the contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/remitchain.wasm \
  --source deployer \
  --network testnet
 
# Returns: CONTRACT_ID (save this)
 
# 3. Initialise the contract
soroban contract invoke \
  --id $CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address deployer)
```
 
---
 
## Sample CLI Invocations
 
### Send a remittance (OFW in Dubai → family in Quezon City)
 
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source ofw_wallet \
  --network testnet \
  -- send_remittance \
  --sender  GOFW111AAABBBCCC \
  --recipient GFAM222DDDEEEFFF \
  --token  GUSDC_CONTRACT_ADDRESS \
  --amount 1000000000 \
  --savings_bps 1000
# amount = 100 USDC (in stroops); savings_bps = 10%
# Returns nonce (u64) — save it for claim step
```
 
### Claim the remittance (family member in PH)
 
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source family_wallet \
  --network testnet \
  -- claim_remittance \
  --sender  GOFW111AAABBBCCC \
  --nonce   1 \
  --recipient GFAM222DDDEEEFFF
# Transfers 90 USDC immediately; 10 USDC stays locked as savings
```
 
### Check if claimed
 
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- is_claimed \
  --sender GOFW111AAABBBCCC \
  --nonce  1
# Returns: true / false
```
 
### Withdraw savings
 
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source family_wallet \
  --network testnet \
  -- withdraw_savings \
  --sender    GOFW111AAABBBCCC \
  --nonce     1 \
  --recipient GFAM222DDDEEEFFF
# Transfers the 10 USDC savings to the beneficiary
```
 
---
 
## Project Structure
 
```
remitchain/
├── Cargo.toml
├── README.md
└── src/
    ├── lib.rs      # Smart contract (register, claim, savings, verify)
    └── test.rs     # 3 unit tests (happy path, edge case, state verification)
```
 
---

## Smart Contract Link
https://stellar.expert/explorer/testnet/tx/9552c99123077b77ac0eca557ec22c6bd860678e0388d5d78763c1f3836bc707
<img width="1423" height="608" alt="Screenshot 2026-04-01 153213" src="https://github.com/user-attachments/assets/9a2eb417-8010-4540-9a19-e558ae366bdd" />


## Frontend
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

MIT © 2026 RemitChain Contributors

