use crate::types::*;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use std::collections::HashMap;

/// Fetches real-time exchange rates from providers.
/// In production, these call actual APIs. In demo mode, uses
/// realistic synthetic data based on observed market spreads.
pub struct RateFetcher {
    demo_mode: bool,
}

impl RateFetcher {
    pub fn new(demo_mode: bool) -> Self {
        Self { demo_mode }
    }

    /// Fetch all available liquidity sources for a currency pair.
    pub async fn fetch_sources(
        &self,
        from: Currency,
        to: Currency,
    ) -> Vec<LiquiditySource> {
        if self.demo_mode {
            self.demo_sources(from, to)
        } else {
            self.live_sources(from, to).await
        }
    }

    /// Demo mode: realistic spreads observed in African FX markets.
    fn demo_sources(&self, from: Currency, to: Currency) -> Vec<LiquiditySource> {
        let mut sources = Vec::new();

        match (from, to) {
            // NGN → XOF corridor
            (Currency::NGN, Currency::XOF) => {
                sources.push(LiquiditySource {
                    id: "mtn-ngn-xof".into(),
                    name: "MTN Mobile Money NGN→XOF".into(),
                    source_type: SourceType::MobileMoney {
                        provider: MobileMoneyProvider::MTN,
                        country: "NG→CI".into(),
                    },
                    currency_pair: (from, to),
                    rate: dec!(1.48), // 1 NGN ≈ 1.48 XOF (parallel market)
                    fee_percent: dec!(0.025), // 2.5%
                    min_amount: dec!(5000),
                    max_amount: dec!(5000000),
                    estimated_settlement_seconds: 120,
                    reliability_score: 0.92,
                });
                sources.push(LiquiditySource {
                    id: "orange-ngn-xof".into(),
                    name: "Orange Money NGN→XOF".into(),
                    source_type: SourceType::MobileMoney {
                        provider: MobileMoneyProvider::Orange,
                        country: "NG→CI".into(),
                    },
                    currency_pair: (from, to),
                    rate: dec!(1.47),
                    fee_percent: dec!(0.030),
                    min_amount: dec!(5000),
                    max_amount: dec!(3000000),
                    estimated_settlement_seconds: 90,
                    reliability_score: 0.95,
                });
                sources.push(LiquiditySource {
                    id: "p2p-binance-ngn-xof".into(),
                    name: "Binance P2P NGN→USDT→XOF".into(),
                    source_type: SourceType::P2PMarket {
                        platform: "Binance".into(),
                    },
                    currency_pair: (from, to),
                    rate: dec!(1.50), // Better rate
                    fee_percent: dec!(0.015), // Lower fee
                    min_amount: dec!(50000),
                    max_amount: dec!(10000000),
                    estimated_settlement_seconds: 600, // Slower
                    reliability_score: 0.85,
                });
            }
            // USDC → XOF corridor
            (Currency::USDC, Currency::XOF) => {
                sources.push(LiquiditySource {
                    id: "uniswap-usdc-usdt".into(),
                    name: "Uniswap USDC→USDT (Polygon)".into(),
                    source_type: SourceType::OnchainPool {
                        protocol: "Uniswap V3".into(),
                        chain: "Polygon".into(),
                        pool_address: "0x...".into(),
                    },
                    currency_pair: (from, Currency::USDT),
                    rate: dec!(1.0001), // Near 1:1 with tiny spread
                    fee_percent: dec!(0.0005), // 0.05% pool fee
                    min_amount: dec!(1),
                    max_amount: dec!(1000000),
                    estimated_settlement_seconds: 15,
                    reliability_score: 0.99,
                });
                sources.push(LiquiditySource {
                    id: "mtn-usdt-xof".into(),
                    name: "MTN Mobile Money USDT→XOF".into(),
                    source_type: SourceType::MobileMoney {
                        provider: MobileMoneyProvider::MTN,
                        country: "CI".into(),
                    },
                    currency_pair: (Currency::USDT, Currency::XOF),
                    rate: dec!(605), // 1 USDT ≈ 605 XOF
                    fee_percent: dec!(0.020),
                    min_amount: dec!(1000),
                    max_amount: dec!(5000000),
                    estimated_settlement_seconds: 180,
                    reliability_score: 0.90,
                });
            }
            // Default: generate plausible rates
            _ => {
                let base_rate = match (from, to) {
                    (Currency::USD, Currency::NGN) => dec!(1550),
                    (Currency::USD, Currency::KES) => dec!(145),
                    (Currency::USD, Currency::XOF) => dec!(605),
                    _ => dec!(1),
                };
                sources.push(LiquiditySource {
                    id: format!("default-{}-{}", from.code(), to.code()),
                    name: format!("{} → {}", from.code(), to.code()),
                    source_type: SourceType::MobileMoney {
                        provider: MobileMoneyProvider::MTN,
                        country: "XX".into(),
                    },
                    currency_pair: (from, to),
                    rate: base_rate,
                    fee_percent: dec!(0.03),
                    min_amount: dec!(1),
                    max_amount: dec!(1000000),
                    estimated_settlement_seconds: 300,
                    reliability_score: 0.80,
                });
            }
        }

        sources
    }

    async fn live_sources(&self, _from: Currency, _to: Currency) -> Vec<LiquiditySource> {
        // In production: call MTN/Orange/M-Pesa APIs, Alchemy for pools, Binance P2P
        todo!("Live API integration")
    }
}
