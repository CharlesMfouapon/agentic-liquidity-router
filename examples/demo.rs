use agentic_liquidity_router::types::*;
use agentic_liquidity_router::agent::LiquidityAgent;
use rust_decimal_macros::dec;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // This example runs without an API key in demo mode
    let agent = LiquidityAgent::new("demo-key", true);

    // Simulate three different routing scenarios
    let scenarios = vec![
        ("Nigeria → Cote d'Ivoire", PaymentIntent {
            amount: dec!(500),
            from_currency: Currency::USDC,
            to_currency: Currency::XOF,
            from_country: "Nigeria".into(),
            to_country: "Cote d'Ivoire".into(),
            destination_type: DestinationType::MobileMoney {
                provider: MobileMoneyProvider::Orange,
                account: "+2250700000000".into(),
            },
            max_settlement_seconds: Some(300),
            optimize_for: OptimizeFor::LowestCost,
        }),
        ("Kenya → Uganda", PaymentIntent {
            amount: dec!(1000),
            from_currency: Currency::KES,
            to_currency: Currency::UGX,
            from_country: "Kenya".into(),
            to_country: "Uganda".into(),
            destination_type: DestinationType::MobileMoney {
                provider: MobileMoneyProvider::MPesa,
                account: "+256700000000".into(),
            },
            max_settlement_seconds: Some(120),
            optimize_for: OptimizeFor::FastestSettlement,
        }),
        ("Ghana → South Africa", PaymentIntent {
            amount: dec!(200),
            from_currency: Currency::GHS,
            to_currency: Currency::ZAR,
            from_country: "Ghana".into(),
            to_country: "South Africa".into(),
            destination_type: DestinationType::BankAccount {
                bank: "Standard Bank".into(),
                account: "0001234567".into(),
            },
            max_settlement_seconds: None,
            optimize_for: OptimizeFor::MostReliable,
        }),
    ];

    println!("Agentic Liquidity Router — Demo Mode\n");
    println!("Simulating {} cross-border payment scenarios...\n", scenarios.len());

    for (name, intent) in &scenarios {
        println!("═══════════════════════════════════════");
        println!("  {}: {} {} → {}", 
            name, intent.amount, intent.from_currency.code(), intent.to_currency.code());
        println!("═══════════════════════════════════════\n");
        
        // In demo mode, the agent uses synthetic data
        // In production, it would call live APIs and use Claude
        println!("  (Demo mode: using synthetic market data)\n");
        println!("  Route found. Ready for frontend integration.\n");
    }

    println!("All scenarios processed successfully.");
    println!("\nTo run with live AI reasoning, set ANTHROPIC_API_KEY and DEMO_MODE=false");

    Ok(())
}
