# Agentic Liquidity Router

**Autonomous AI agent for cross-border payment routing across African mobile money rails and onchain liquidity.**

Not a chatbot. Not a simple swap widget. An agent that observes real-time rates, reasons about optimal paths, and routes value across the most complex payment corridors in the world.

## The Problem

Sending money between African countries is expensive, slow, and opaque. A payment from Nigeria to Cote d'Ivoire might route through:
- NGN → USDT on Binance P2P
- USDT → XOF via MTN Mobile Money
- Alternatively: NGN → USD via bank wire → XOF via Orange Money

Each path has different fees, settlement times, and reliability. The optimal route changes by the hour.

## How It Works

User Intent
│
▼
┌─────────────────────────────┐
│ Rate Fetcher │
│ MTN │ Orange │ M-Pesa │
│ Uniswap │ Curve │ Binance │
└──────────┬──────────────────┘
│
▼
┌─────────────────────────────┐
│ AI Agent (Claude 3.5) │
│ Observes rates │
│ Reasons about context │
│ Evaluates routes │
│ Returns optimal path │
└──────────┬──────────────────┘
│
▼
┌─────────────────────────────┐
│ Routing Decision │
│ Route + Fee + ETA + Risk │
│ Confidence score │
│ Alternatives │
└─────────────────────────────┘


## Supported Corridors

| Corridor | Providers | Avg Fee | Settlement |
|---|---|---|---|
| Nigeria → Cote d'Ivoire | MTN, Orange, Binance P2P | 1.5-3% | 1-10 min |
| Kenya → Uganda | M-Pesa, Wave | 1-2% | 1-3 min |
| Ghana → South Africa | MTN, Bank wire | 2-4% | 5-30 min |
| USDC → XOF | Uniswap + Orange | 0.5-2% | 30 sec - 3 min |

## Tech Stack

| Component | Technology |
|---|---|
| Agent framework | Rig (Rust) |
| Reasoning | Claude 3.5 Sonnet |
| Rate data | Provider APIs + Alchemy |
| Demo frontend | Next.js + OnchainKit |
| Simulation | Tenderly dry-run |

## Quick Start

```bash
# Clone
git clone https://github.com/CharlesMfouapon/agentic-liquidity-router
cd agentic-liquidity-router

# Run demo (no API keys needed)
cargo run --example demo

# Run with AI (requires Anthropic key)
export ANTHROPIC_API_KEY=sk-ant-...
export DEMO_MODE=false
cargo run --release

## Frontend Demo

```bash
cd frontend
npm install
npm run dev

http://localhost:3000
```
The demo works without API keys — it uses synthetic market data validated against real African FX corridor spreads.

To enable live AI reasoning: 
```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

## Architecture Decision Records
**ADR-001: Rust + Rig over Python + LangChain —** Zero-cost abstractions for the agent loop. Rig compiles to WASM for browser-side inference if needed.

**ADR-002: Claude 3.5 Sonnet over GPT-4 —** Superior reasoning for structured financial decisions. Lower latency for real-time routing.

**ADR-003: Demo-first with synthetic data —** Real provider APIs require commercial agreements. Synthetic data validated against observed market spreads enables immediate demonstration.
