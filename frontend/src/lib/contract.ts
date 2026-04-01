import {
  Contract,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  Address,
  xdr,
} from '@stellar/stellar-sdk'
import type {
  StellarAddress,
  RemittanceRecord,
  InvokeResult,
  TokenSymbol,
} from '@/types'
import {
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_URL,
  TOKENS,
  toStroops,
} from './constants'

// ─── RPC server singleton ─────────────────────────────────────────────────────

let _server: SorobanRpc.Server | null = null

function getServer(): SorobanRpc.Server {
  if (!_server) {
    _server = new SorobanRpc.Server(RPC_URL, { allowHttp: true })
  }
  return _server
}

// ─── Helper: simulate a Soroban transaction ───────────────────────────────────

async function simulateAndSubmit(
  sourceAddress: StellarAddress,
  contractFn: string,
  args: xdr.ScVal[],
): Promise<InvokeResult<unknown>> {
  try {
    const server  = getServer()
    const account = await server.getAccount(sourceAddress)
    const contract = new Contract(CONTRACT_ID)

    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(contractFn, ...args))
      .setTimeout(30)
      .build()

    const simResult = await server.simulateTransaction(tx)

    if (SorobanRpc.Api.isSimulationError(simResult)) {
      return { success: false, error: simResult.error }
    }

    // In a real app you'd sign with a wallet (Freighter, xBull) here.
    // For testnet demo we just return the simulation result.
    return {
      success: true,
      data: simResult,
      hash: tx.hash().toString('hex'),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

// ─── send_remittance ──────────────────────────────────────────────────────────

export interface SendRemittanceParams {
  sender:     StellarAddress
  recipient:  StellarAddress
  token:      TokenSymbol
  amount:     number          // human-readable (e.g. 100.5)
  savingsBps: number          // 0–10000
}

export async function sendRemittance(
  params: SendRemittanceParams,
): Promise<InvokeResult<{ nonce: number }>> {
  const { sender, recipient, token, amount, savingsBps } = params
  const tokenMeta = TOKENS[token]

  const args: xdr.ScVal[] = [
    new Address(sender).toScVal(),
    new Address(recipient).toScVal(),
    new Address(tokenMeta.contractId).toScVal(),
    nativeToScVal(toStroops(amount), { type: 'i128' }),
    nativeToScVal(savingsBps, { type: 'u32' }),
  ]

  const result = await simulateAndSubmit(sender, 'send_remittance', args)
  if (!result.success) return result

  // In real flow: parse returned nonce from simulation result
  const mockNonce = Math.floor(Math.random() * 1000) + 1
  return { ...result, data: { nonce: mockNonce } }
}

// ─── claim_remittance ─────────────────────────────────────────────────────────

export interface ClaimRemittanceParams {
  sender:    StellarAddress
  nonce:     number
  recipient: StellarAddress
}

export async function claimRemittance(
  params: ClaimRemittanceParams,
): Promise<InvokeResult<void>> {
  const { sender, nonce, recipient } = params

  const args: xdr.ScVal[] = [
    new Address(sender).toScVal(),
    nativeToScVal(BigInt(nonce), { type: 'u64' }),
    new Address(recipient).toScVal(),
  ]

  return simulateAndSubmit(recipient, 'claim_remittance', args)
}

// ─── withdraw_savings ─────────────────────────────────────────────────────────

export interface WithdrawSavingsParams {
  sender:    StellarAddress
  nonce:     number
  recipient: StellarAddress
}

export async function withdrawSavings(
  params: WithdrawSavingsParams,
): Promise<InvokeResult<void>> {
  const { sender, nonce, recipient } = params

  const args: xdr.ScVal[] = [
    new Address(sender).toScVal(),
    nativeToScVal(BigInt(nonce), { type: 'u64' }),
    new Address(recipient).toScVal(),
  ]

  return simulateAndSubmit(recipient, 'withdraw_savings', args)
}

// ─── is_claimed ───────────────────────────────────────────────────────────────

export async function isClaimed(
  sender: StellarAddress,
  nonce: number,
): Promise<InvokeResult<boolean>> {
  const args: xdr.ScVal[] = [
    new Address(sender).toScVal(),
    nativeToScVal(BigInt(nonce), { type: 'u64' }),
  ]

  const result = await simulateAndSubmit(sender, 'is_claimed', args)
  if (!result.success) return result

  // Parse boolean from sim result
  try {
    const sim = result.data as SorobanRpc.Api.SimulateTransactionSuccessResponse
    const retVal = sim.result?.retval
    const claimed = retVal ? scValToNative(retVal) as boolean : false
    return { success: true, data: claimed }
  } catch {
    return { success: true, data: false }
  }
}

// ─── get_remittance ───────────────────────────────────────────────────────────

export async function getRemittance(
  sender: StellarAddress,
  nonce: number,
): Promise<InvokeResult<RemittanceRecord>> {
  const args: xdr.ScVal[] = [
    new Address(sender).toScVal(),
    nativeToScVal(BigInt(nonce), { type: 'u64' }),
  ]

  const result = await simulateAndSubmit(sender, 'get_remittance', args)
  if (!result.success) return result

  // In a real app: parse the returned struct from scValToNative
  // For demo we return a mock record
  const mockRecord: RemittanceRecord = {
    sender,
    recipient: 'GFAM9PQRUVBHQJT2NE5A6CDWYZMSB2D4K',
    amount:    1_000_000_000n,
    claimed:   false,
    savingsBps: 1000,
    token:     TOKENS.USDC.contractId,
  }
  return { success: true, data: mockRecord }
}

// ─── Horizon: fetch account balance ──────────────────────────────────────────

export async function fetchXlmBalance(
  address: StellarAddress,
): Promise<number> {
  try {
    const res = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${address}`,
    )
    if (!res.ok) return 0
    const data = await res.json() as {
      balances: Array<{ balance: string; asset_type: string }>
    }
    const native = data.balances.find(b => b.asset_type === 'native')
    return native ? parseFloat(native.balance) : 0
  } catch {
    return 0
  }
}

// ─── Horizon: latest ledger ───────────────────────────────────────────────────

export async function fetchLatestLedger(): Promise<number> {
  try {
    const res = await fetch('https://horizon-testnet.stellar.org/ledgers?order=desc&limit=1')
    if (!res.ok) return 0
    const data = await res.json() as {
      _embedded: { records: Array<{ sequence: number }> }
    }
    return data._embedded.records[0]?.sequence ?? 0
  } catch {
    return 0
  }
}
