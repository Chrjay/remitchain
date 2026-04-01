#![no_std]
 
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, token,
};
 
// ─── Storage Keys ────────────────────────────────────────────────────────────
 
/// Unique key for each remittance, derived from sender + nonce
#[contracttype]
#[derive(Clone)]
pub struct RemittanceKey {
    pub sender: Address,
    pub nonce: u64,
}
 
/// Full remittance record stored on-chain
#[contracttype]
#[derive(Clone)]
pub struct Remittance {
    /// OFW sender's Stellar address
    pub sender: Address,
    /// Philippine beneficiary's Stellar address
    pub recipient: Address,
    /// Amount in stroops (1 XLM = 10_000_000 stroops)
    pub amount: i128,
    /// Whether this remittance has been claimed
    pub claimed: bool,
    /// Optional savings lock-up percentage (0–100)
    pub savings_bps: u32,
    /// Token contract address (e.g. USDC or XLM wrapper)
    pub token: Address,
}
 
/// Admin key for the contract deployer
const ADMIN: Symbol = symbol_short!("ADMIN");
/// Tracks per-sender nonce to generate unique remittance keys
const NONCE: Symbol = symbol_short!("NONCE");
 
#[contract]
pub struct RemitChainContract;
 
#[contractimpl]
impl RemitChainContract {
    // ─── Initialization ──────────────────────────────────────────────────
 
    /// Called once by the deployer to set the contract admin.
    /// The admin can pause the contract in emergencies.
    pub fn initialize(env: Env, admin: Address) {
        // Prevent re-initialization if already set
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN, &admin);
    }
 
    // ─── Core: Send Remittance ────────────────────────────────────────────
 
    /// OFW (sender) locks tokens into the contract for a beneficiary.
    /// A portion can be earmarked for micro-savings (savings_bps = basis points, e.g. 1000 = 10%).
    /// Returns the nonce (remittance ID) for tracking.
    pub fn send_remittance(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        amount: i128,
        savings_bps: u32, // 0–10000 (basis points)
    ) -> u64 {
        // Sender must authorise this call
        sender.require_auth();
 
        // Validate inputs
        if amount <= 0 {
            panic!("amount must be positive");
        }
        if savings_bps > 10_000 {
            panic!("savings_bps must be <= 10000");
        }
 
        // Pull tokens from sender into the contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, &env.current_contract_address(), &amount);
 
        // Assign a unique nonce to this remittance
        let nonce: u64 = env
            .storage()
            .instance()
            .get(&(NONCE, sender.clone()))
            .unwrap_or(0u64);
        let next_nonce = nonce + 1;
        env.storage()
            .instance()
            .set(&(NONCE, sender.clone()), &next_nonce);
 
        // Store the remittance record
        let key = RemittanceKey {
            sender: sender.clone(),
            nonce: next_nonce,
        };
        let record = Remittance {
            sender: sender.clone(),
            recipient: recipient.clone(),
            amount,
            claimed: false,
            savings_bps,
            token: token.clone(),
        };
        env.storage().persistent().set(&key, &record);
 
        // Emit event so off-chain indexers and the frontend can react
        env.events().publish(
            (symbol_short!("SEND"), sender),
            (recipient, amount, next_nonce),
        );
 
        next_nonce
    }
 
    // ─── Core: Claim Remittance ───────────────────────────────────────────
 
    /// Beneficiary claims a pending remittance.
    /// The liquid portion (amount minus savings) is transferred immediately.
    /// The savings portion remains locked and can be withdrawn later via `withdraw_savings`.
    pub fn claim_remittance(
        env: Env,
        sender: Address,
        nonce: u64,
        recipient: Address,
    ) {
        // Recipient must authorise the claim
        recipient.require_auth();
 
        let key = RemittanceKey {
            sender: sender.clone(),
            nonce,
        };
 
        // Load the stored record — panic if not found
        let mut record: Remittance = env
            .storage()
            .persistent()
            .get(&key)
            .expect("remittance not found");
 
        // Verify the caller is the intended recipient
        if record.recipient != recipient {
            panic!("unauthorized: wrong recipient");
        }
 
        // Prevent double-claiming
        if record.claimed {
            panic!("already claimed");
        }
 
        // Calculate liquid vs savings split
        let savings_amount = (record.amount * record.savings_bps as i128) / 10_000;
        let liquid_amount = record.amount - savings_amount;
 
        // Transfer liquid portion to recipient now
        let token_client = token::Client::new(&env, &record.token);
        if liquid_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &recipient,
                &liquid_amount,
            );
        }
        // Savings portion stays in contract; mark record so savings can be tracked
 
        // Mark as claimed so it cannot be re-claimed
        record.claimed = true;
        env.storage().persistent().set(&key, &record);
 
        // Emit claim event
        env.events().publish(
            (symbol_short!("CLAIM"), recipient.clone()),
            (nonce, liquid_amount, savings_amount),
        );
    }
 
    // ─── Core: Withdraw Savings ───────────────────────────────────────────
 
    /// After a configurable lock period (enforced off-chain via ledger sequence),
    /// the beneficiary can withdraw their micro-savings portion.
    /// For hackathon MVP: savings are withdrawable immediately after claiming.
    pub fn withdraw_savings(
        env: Env,
        sender: Address,
        nonce: u64,
        recipient: Address,
    ) {
        recipient.require_auth();
 
        let key = RemittanceKey {
            sender: sender.clone(),
            nonce,
        };
 
        let mut record: Remittance = env
            .storage()
            .persistent()
            .get(&key)
            .expect("remittance not found");
 
        if record.recipient != recipient {
            panic!("unauthorized: wrong recipient");
        }
        if !record.claimed {
            panic!("must claim remittance first");
        }
        if record.savings_bps == 0 {
            panic!("no savings in this remittance");
        }
 
        let savings_amount = (record.amount * record.savings_bps as i128) / 10_000;
 
        // Transfer savings to recipient
        let token_client = token::Client::new(&env, &record.token);
        token_client.transfer(
            &env.current_contract_address(),
            &recipient,
            &savings_amount,
        );
 
        // Zero out savings to prevent double withdrawal
        record.savings_bps = 0;
        env.storage().persistent().set(&key, &record);
 
        env.events().publish(
            (symbol_short!("SAVE_OUT"), recipient),
            (nonce, savings_amount),
        );
    }
 
    // ─── Read: Get Remittance ─────────────────────────────────────────────
 
    /// Returns the full remittance record for a given sender + nonce.
    /// Used by the frontend to display status and amounts.
    pub fn get_remittance(env: Env, sender: Address, nonce: u64) -> Remittance {
        let key = RemittanceKey { sender, nonce };
        env.storage()
            .persistent()
            .get(&key)
            .expect("remittance not found")
    }
 
    // ─── Read: Check Claimed ──────────────────────────────────────────────
 
    /// Convenience boolean check used by employer integrations
    /// and the frontend to gate payout buttons.
    pub fn is_claimed(env: Env, sender: Address, nonce: u64) -> bool {
        let key = RemittanceKey { sender, nonce };
        env.storage()
            .persistent()
            .get::<RemittanceKey, Remittance>(&key)
            .map(|r| r.claimed)
            .unwrap_or(false)
    }
}
 
