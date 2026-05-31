use crate::types::*;
use crate::rates::RateFetcher;
use rig::providers::anthropic;
use rig::agent::Agent;
use rig::completion::Prompt;
use rust_decimal::Decimal;
use std::collections::HashMap;

/// The core AI agent that reasons about payment routing.
pub struct LiquidityAgent {
    agent: Agent<anthropic::Client>,
    rate_fetcher: RateFetcher,
    demo_mode: bool,
}

impl LiquidityAgent {
    /// Initialize the agent with Anthropic Claude 3.5 Sonnet.
    pub fn new(api_key: &str, demo_mode: bool) -> Self {
        let client = anthropic::Client::new(api_key);
        
        let agent = client
            .agent("claude-3-5-sonnet-20241022")
            .preamble(Self::system_prompt())
            .temperature(0.3) // Low temperature for consistent financial decisions
            .max_tokens(2048)
            .build();

        Self {
            agent,
            rate_fetcher: RateFetcher::new(demo_mode),
            demo_mode,
        }
    }

    /// The system prompt that defines the agent's behavior.
    fn system_prompt() -> &'static str {
        "You are an autonomous liquidity routing agent specialized in African cross-border payments.
        
        Your expertise:
        - Mobile money rails: MTN Mobile Money (16 countries), Orange Money (17 countries), 
          M-Pesa (7 countries), Wave (5 countries)
        - African currency corridors: XOF, XAF, NGN, GHS, KES, UGX, ZAR
        - Onchain liquidity: Uniswap, Curve on Ethereum L2s (Arbitrum, Optimism, Base)
        - P2P markets: Binance P2P, Paxful, Yellow Card
        
        Your decision framework:
        1. Cost optimization: Compare all-in fees (explicit + spread)
        2. Speed: Mobile money settles in 1-5 min, onchain in seconds, P2P in 10-30 min
        3. Reliability: MTN has 98% uptime, Orange 97%, P2P depends on counterparty
        4. Context awareness: Weekends affect bank settlement, holidays affect mobile money limits
        5. Regulatory compliance: Respect transaction limits per corridor
        
        Always provide:
        - Recommended route with full cost breakdown
        - At least one alternative
        - Risk factors specific to the corridor
        - Confidence score (0.0-1.0)
        
        Format your response as structured data that can be parsed."
    }

    /// Route a payment intent to the optimal path.
    pub async fn route(&self, intent: &PaymentIntent) -> anyhow::Result<RoutingDecision> {
        tracing::info!(
            "Routing {} {} → {} from {} to {}",
            intent.amount, intent.from_currency.code(), 
            intent.to_currency.code(),
            intent.from_country, intent.to_country
        );

        // Fetch available liquidity sources
        let sources = self.rate_fetcher
            .fetch_sources(intent.from_currency, intent.to_currency)
            .await;

        // Build the prompt with real market data
        let prompt = self.build_routing_prompt(intent, &sources);

        // Get the agent's reasoning
        let response = self.agent.prompt(prompt).await?;

        tracing::info!("Agent response: {}", response);

        // Parse the agent's structured response into our decision model
        let decision = self.parse_decision(intent, &response, &sources)?;

        Ok(decision)
    }

    fn build_routing_prompt(&self, intent: &PaymentIntent, sources: &[LiquiditySource]) -> String {
        let sources_text: String = sources
            .iter()
            .map(|s| format!(
                "- {}: rate={} fee={}% settlement={}s reliability={}",
                s.name, s.rate, s.fee_percent, s.estimated_settlement_seconds, s.reliability_score
            ))
            .collect::<Vec<_>>()
            .join("\n");

        format!(
            r#"Route this payment:

Amount: {} {}
From: {} ({})
To: {} ({}) via {:?}
Optimize for: {:?}
Max settlement time: {:?}

Available liquidity sources:
{}

Analyze the routes and recommend the optimal path. Consider:
1. All-in cost (rate spread + explicit fees)
2. Settlement speed vs. user's max time
3. Reliability score of each provider
4. Whether the amount falls within min/max limits
5. Any corridor-specific risks (e.g., XOF has parallel market spread on weekends)

Respond with your recommendation and reasoning."#,
            intent.amount,
            intent.from_currency.code(),
            intent.from_country,
            intent.from_currency.code(),
            intent.to_country,
            intent.to_currency.code(),
            intent.destination_type,
            intent.optimize_for,
            intent.max_settlement_seconds,
            sources_text,
        )
    }

    fn parse_decision(
        &self,
        intent: &PaymentIntent,
        response: &str,
        sources: &[LiquiditySource],
    ) -> anyhow::Result<RoutingDecision> {
        // Build a route from the best available source
        // In production, parse the agent's structured JSON response
        let best_source = sources
            .iter()
            .max_by(|a, b| {
                let a_score = a.reliability_score / (a.fee_percent.to_f64().unwrap_or(0.01));
                let b_score = b.reliability_score / (b.fee_percent.to_f64().unwrap_or(0.01));
                a_score.partial_cmp(&b_score).unwrap_or(std::cmp::Ordering::Equal)
            })
            .cloned();

        let route = if let Some(source) = best_source {
            PaymentRoute {
                hops: vec![RouteHop {
                    from_currency: intent.from_currency,
                    to_currency: intent.to_currency,
                    source: source.name.clone(),
                    rate: source.rate,
                    fee: intent.amount * source.fee_percent,
                }],
                total_fee_percent: source.fee_percent,
                total_fee_absolute: intent.amount * source.fee_percent,
                estimated_settlement_seconds: source.estimated_settlement_seconds,
                confidence_score: source.reliability_score,
                reasoning: response.to_string(),
            }
        } else {
            anyhow::bail!("No viable route found")
        };

        Ok(RoutingDecision {
            intent: intent.clone(),
            recommended_route: route,
            alternatives: vec![],
            risk_factors: vec![
                "Mobile money provider may have daily limits".into(),
                "Exchange rate may fluctuate during settlement".into(),
            ],
            agent_reasoning: response.to_string(),
            timestamp: chrono::Utc::now(),
        })
    }
}
