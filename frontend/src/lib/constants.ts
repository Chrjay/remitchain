import type { TokenMeta, TokenSymbol } from '@/types'

// ─── Soroban contract ─────────────────────────────────────────────────────────

export const CONTRACT_ID =
  import.meta.env.VITE_CONTRACT_ID ??
  'CDRSMX4BQOQN2HPNZB7KYXHJ3WRSM7UAKQ5VNZ4YL'

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE ??
  'Test SDF Network ; September 2015'

export const RPC_URL =
  import.meta.env.VITE_RPC_URL ??
  'https://soroban-testnet.stellar.org'

export const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ??
  'https://horizon-testnet.stellar.org'

// ─── Token metadata ───────────────────────────────────────────────────────────

export const TOKENS: Record<TokenSymbol, TokenMeta> = {
  USDC: {
    symbol:     'USDC',
    name:       'Circle USD Coin',
    decimals:   7,
    usdRate:    1.0,
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  },
  XLM: {
    symbol:     'XLM',
    name:       'Stellar Lumens',
    decimals:   7,
    usdRate:    0.1142,
    contractId: 'CDMLFMKMMD7MWZP3FKUBZPVHTUEDLSX4BYGYKH4GCESXYHS3IHQ4EIG4',
  },
  PHP: {
    symbol:     'PHP',
    name:       'Philippine Peso Token',
    decimals:   7,
    usdRate:    0.0175,
    contractId: 'CBPHP7TESTTOKEN0000000000000000000000000000000000000000000',
  },
}

// ─── Fee comparison data ──────────────────────────────────────────────────────

export const FEE_COMPARISONS = [
  { service: 'RemitChain',    pct: 0.001, barWidth: 1  },
  { service: 'GCash Padala',  pct: 3.0,   barWidth: 30 },
  { service: 'Western Union', pct: 5.5,   barWidth: 55 },
  { service: 'Bank Wire',     pct: 8.0,   barWidth: 80 },
] as const

// ─── Demo wallet (pre-filled for testnet demo) ────────────────────────────────

export const DEMO_SENDER =
  'GOFW3KLDM9XPQR74UVBHQJT2NE5A6CDWYZMSB2D4K'

export const DEMO_RECIPIENT =
  'GFAM9PQRUVBHQJT2NE5A6CDWYZMSB2D4KGOFW3KLD'

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const STROOPS_PER_TOKEN = 10_000_000n

export function toStroops(amount: number): bigint {
  return BigInt(Math.round(amount * Number(STROOPS_PER_TOKEN)))
}

export function fromStroops(stroops: bigint): number {
  return Number(stroops) / Number(STROOPS_PER_TOKEN)
}

export function truncateAddress(addr: string, head = 6, tail = 4): string {
  if (addr.length <= head + tail + 3) return addr
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`
}
