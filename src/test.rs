#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
        token, Address, Env, IntoVal,
    };
    use token::Client as TokenClient;
    use token::StellarAssetClient as StellarAssetClientTrait;
 
    /// Helper: deploy a mock Stellar token and mint `amount` to `to`.
    fn create_token<'a>(
        env: &Env,
        admin: &Address,
    ) -> (Address, TokenClient<'a>) {
        // Register the built-in Stellar asset contract
        let contract_id = env.register_stellar_asset_contract(admin.clone());
        let client = TokenClient::new(env, &contract_id);
        (contract_id, client)
    }
 
    fn setup() -> (Env, Address, Address, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
 
        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
 
        // Deploy RemitChain contract
        let contract_id = env.register_contract(None, RemitChainContract);
        let contract_client = RemitChainContractClient::new(&env, &contract_id);
        contract_client.initialize(&admin);
 
        // Deploy token and mint 1000 XLM (in stroops) to sender
        let (token_id, token_client) = create_token(&env, &admin);
        let asset_client = StellarAssetClientTrait::new(&env, &token_id);
        asset_client.mint(&sender, &1_000_000_000i128); // 100 XLM
 
        (env, contract_id, sender, recipient, token_id, admin)
    }
 
    // ─── Test 1: Happy Path ───────────────────────────────────────────────
    /// A complete send + claim flow executes successfully end-to-end.
    /// The recipient receives the liquid portion (90%) and
    /// the savings portion (10%) remains in the contract.
    #[test]
    fn test_send_and_claim_happy_path() {
        let (env, contract_id, sender, recipient, token_id, _) = setup();
        let client = RemitChainContractClient::new(&env, &contract_id);
        let token = TokenClient::new(&env, &token_id);
 
        let send_amount: i128 = 100_000_000; // 10 XLM
        let savings_bps: u32 = 1_000; // 10%
 
        // OFW sends remittance with 10% savings
        let nonce = client.send_remittance(
            &sender,
            &recipient,
            &token_id,
            &send_amount,
            &savings_bps,
        );
        assert_eq!(nonce, 1u64, "first remittance should have nonce 1");
 
        // Contract now holds the funds
        assert_eq!(
            token.balance(&contract_id),
            send_amount,
            "contract should hold full amount after send"
        );
 
        // Recipient claims
        client.claim_remittance(&sender, &nonce, &recipient);
 
        // Liquid portion: 90% = 90_000_000 stroops
        let expected_liquid: i128 = send_amount - (send_amount * 1_000 / 10_000);
        assert_eq!(
            token.balance(&recipient),
            expected_liquid,
            "recipient should receive liquid portion"
        );
 
        // Contract still holds the savings portion (10%)
        let expected_savings: i128 = send_amount * 1_000 / 10_000;
        assert_eq!(
            token.balance(&contract_id),
            expected_savings,
            "contract should retain savings portion"
        );
 
        // Record should be marked claimed
        let record = client.get_remittance(&sender, &nonce);
        assert!(record.claimed, "remittance should be marked claimed");
    }
 
    // ─── Test 2: Edge Case — Double Claim Rejected ────────────────────────
    /// Attempting to claim the same remittance twice must panic.
    /// This protects beneficiaries from replay attacks and double-spend bugs.
    #[test]
    #[should_panic(expected = "already claimed")]
    fn test_double_claim_is_rejected() {
        let (env, contract_id, sender, recipient, token_id, _) = setup();
        let client = RemitChainContractClient::new(&env, &contract_id);
 
        let nonce = client.send_remittance(
            &sender,
            &recipient,
            &token_id,
            &50_000_000i128,
            &0u32,
        );
 
        // First claim succeeds
        client.claim_remittance(&sender, &nonce, &recipient);
 
        // Second claim must panic with "already claimed"
        client.claim_remittance(&sender, &nonce, &recipient);
    }
 
    // ─── Test 3: State Verification ──────────────────────────────────────
    /// After a successful send, contract storage must accurately reflect
    /// the sender, recipient, amount, savings_bps, and claimed=false.
    #[test]
    fn test_storage_state_after_send() {
        let (env, contract_id, sender, recipient, token_id, _) = setup();
        let client = RemitChainContractClient::new(&env, &contract_id);
 
        let amount: i128 = 200_000_000; // 20 XLM
        let savings_bps: u32 = 2_000; // 20% savings
 
        let nonce = client.send_remittance(
            &sender,
            &recipient,
            &token_id,
            &amount,
            &savings_bps,
        );
 
        // Fetch and verify every stored field
        let record = client.get_remittance(&sender, &nonce);
 
        assert_eq!(record.sender, sender, "stored sender must match");
        assert_eq!(record.recipient, recipient, "stored recipient must match");
        assert_eq!(record.amount, amount, "stored amount must match");
        assert_eq!(record.savings_bps, savings_bps, "stored savings_bps must match");
        assert!(!record.claimed, "newly sent remittance must not be claimed");
        assert_eq!(record.token, token_id, "stored token address must match");
 
        // is_claimed convenience fn must return false
        assert!(
            !client.is_claimed(&sender, &nonce),
            "is_claimed must return false before claiming"
        );
    }
}
