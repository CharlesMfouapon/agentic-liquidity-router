use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::fmt;

/// African mobile money providers
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MobileMoneyProvider {
    #[serde(rename = "mtn")]
    MTN,
    #[serde(rename = "orange")]
    Orange,
    #[serde(rename = "mpesa")]
    MPesa,
    #[serde(rename = "wave")]
    Wave,
    #[serde(rename = "moov")]
    Moov,
}

impl fmt::Display for MobileMoneyProvider {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MTN => write!(f, "MTN Mobile Money"),
            Self::Orange => write!(f, "Orange Money"),
            Self::MPesa => write!(f, "M-Pesa"),
            Self::Wave => write!(f, "Wave"),
            Self::Moov => write!(f, "Moov Money"),
        }
    }
}

/// African fiat currencies
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Currency {
    XOF, XAF, NGN, GHS, KES, UGX, ZAR,
    USD, EUR,
    USDC, USDT,
}

impl Currency {
    pub fn code(&self) -> &str {
        match self {
            Self::XOF => "XOF", Self::XAF => "XAF",
            Self::NGN => "NGN", Self::GHS => "GHS",
            Self::KES => "KES", Self::UGX => "UGX",
            Self::ZAR => "ZAR", Self::USD => "USD",
            Self::EUR => "EUR", Self::USDC => "USDC",
            Self::USDT => "USDT",
        }
    }
}

/// A liquidity source: mobile money provider, onchain pool, or P2P market
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiquiditySource {
    pub id: String,
    pub name: String,
    pub source_type: SourceType,
    pub currency_pair: (Currency, Currency),
    pub rate: Decimal,
    pub fee_percent: Decimal,
    pub min_amount: Decimal,
    pub max_amount: Decimal,
    pub estimated_settlement_seconds: u64,
    pub reliability_score: f64, // 0.0 to 1.0
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SourceType {
    MobileMoney {
        provider: MobileMoneyProvider,
        country: String,
    },
    OnchainPool {
        protocol: String,
        chain: String,
        pool_address: String,
    },
    P2PMarket {
        platform: String,
    },
}

/// A complete payment route from source to destination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentRoute {
    pub hops: Vec<RouteHop>,
    pub total_fee_percent: Decimal,
    pub total_fee_absolute: Decimal,
    pub estimated_settlement_seconds: u64,
    pub confidence_score: f64,
    pub reasoning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteHop {
    pub from_currency: Currency,
    pub to_currency: Currency,
    pub source: String,
    pub rate: Decimal,
    pub fee: Decimal,
}

/// A user's payment intent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentIntent {
    pub amount: Decimal,
    pub from_currency: Currency,
    pub to_currency: Currency,
    pub from_country: String,
    pub to_country: String,
    pub destination_type: DestinationType,
    pub max_settlement_seconds: Option<u64>,
    pub optimize_for: OptimizeFor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DestinationType {
    MobileMoney { provider: MobileMoneyProvider, account: String },
    BankAccount { bank: String, account: String },
    Wallet { address: String, chain: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizeFor {
    LowestCost,
    FastestSettlement,
    MostReliable,
}

/// The agent's decision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingDecision {
    pub intent: PaymentIntent,
    pub recommended_route: PaymentRoute,
    pub alternatives: Vec<PaymentRoute>,
    pub risk_factors: Vec<String>,
    pub agent_reasoning: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}
