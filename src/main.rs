mod types;
mod rates;
mod agent;

use types::*;
use agent::LiquidityAgent;
use rust_decimal_macros::dec;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    let demo_mode = std::env::var("DEMO_MODE").unwrap_or("true".into()) == "true";
    let api_key = std::env::var("ANTHROPIC_API_KEY")
        .unwrap_or_else(|_| "demo-key".into());

    let agent = LiquidityAgent::new(&api_key, demo_mode);

    // Example: Route $500 USDC to XOF via Orange Money in Cote d'Ivoire
    let intent = PaymentIntent {
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
    };

    println!("╔══════════════════════════════════════════╗");
    println!("║   AGENTIC LIQUIDITY ROUTER              ║");
    println!("║   Cross-Border Payment Optimization    ║");
    println!("╚══════════════════════════════════════════╝\n");

    println!("Payment Intent:");
    println!("  Amount: {} {}", intent.amount, intent.from_currency.code());
    println!("  From: {} ({})", intent.from_country, intent.from_currency.code());
    println!("  To: {} ({})", intent.to_country, intent.to_currency.code());
    println!("  Destination: {:?}", intent.destination_type);
    println!("  Optimize for: {:?}\n", intent.optimize_for);

    println!("Querying AI agent for optimal route...\n");

    match agent.route(&intent).await {
        Ok(decision) => {
            println!("═══════════════════════════════════════════");
            println!("  AGENT DECISION");
            println!("═══════════════════════════════════════════\n");
            
            println!("Recommended Route:");
            for hop in &decision.recommended_route.hops {
                println!("  {} → {} via {}", 
                    hop.from_currency.code(),
                    hop.to_currency.code(),
                    hop.source
                );
                println!("    Rate: {}", hop.rate);
                println!("    Fee: {:.2}", hop.fee);
            }
            
            println!("\nSummary:");
            println!("  Total fee: {:.2}% ({:.2} {})",
                decision.recommended_route.total_fee_percent,
                decision.recommended_route.total_fee_absolute,
                decision.intent.from_currency.code()
            );
            println!("  Settlement: ~{}s",
                decision.recommended_route.estimated_settlement_seconds
            );
            println!("  Confidence: {:.1}%",
                decision.recommended_route.confidence_score * 100.0
            );

            println!("\nRisk Factors:");
            for risk in &decision.risk_factors {
                println!("  • {}", risk);
            }

            println!("\nAgent Reasoning:");
            println!("  {}\n", decision.agent_reasoning);
        }
        Err(e) => {
            eprintln!("Routing failed: {}", e);
        }
    }

    Ok(())
}
