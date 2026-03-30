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

## SAMPLE LINK OF CONTRACT ID
https://stellar.expert/explorer/testnet/tx/9552c99123077b77ac0eca557ec22c6bd860678e0388d5d78763c1f3836bc707

## License
 
MIT © 2026 RemitChain Contributors
