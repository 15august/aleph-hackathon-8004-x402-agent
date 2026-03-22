# Aleph Hackathon — Avalanche Track

AI-powered property search with on-chain payments via x402 and ERC-8004 agent identity on Avalanche Fuji.

**Related repo (AI search backend):** https://github.com/15august/agentic-search-mp-hackathon-x402

---

## What we built

A full-stack system where users pay $0.01 USDC per property search query using the x402 HTTP payment protocol, while the search is handled by an AI agent registered on-chain via ERC-8004.

```
User (MetaMask)
    │
    │  x402 payment ($0.01 USDC on Avalanche Fuji)
    ▼
x402-starter-kit  (Next.js frontend + payment middleware)
    │
    │  POST /api/search  (after payment settled)
    ▼
agentic-search backend  (NestJS on Railway)
    │  ├── scrapes property listings
    │  ├── analyzes photos with Claude Vision
    │  └── returns ranked results with AI commentary
    ▼
Results shown in UI (photo, price, score, highlights)
```

The AI search agent is also registered on Avalanche Fuji via **ERC-8004** — an on-chain identity standard that gives AI agents verifiable identities, reputation, and capability validation.

---

## Repositories

| Repo | Description |
|------|-------------|
| **This repo** | x402 payment frontend + ERC-8004 agent registration |
| [agentic-search-mp-hackathon-x402](https://github.com/15august/agentic-search-mp-hackathon-x402) | NestJS backend: property scraping, Claude Vision photo analysis, x402 API |

---

## Projects in this repo

### `x402-starter-kit/` — Payment Frontend

Next.js app that lets users search for properties by paying $0.01 USDC via the x402 protocol.

**Tech stack:**
- Next.js 15 + React 19
- [thirdweb SDK v5](https://thirdweb.com) — wallet connect, x402 payment wrapping, settlement
- Avalanche Fuji testnet, USDC token
- Tailwind CSS + shadcn/ui

**Flow:**
1. User connects wallet (MetaMask or any EVM wallet)
2. Types a natural language query (e.g. "2 ambientes en Palermo")
3. `wrapFetchWithPayment` intercepts the request, sends 402 → signs payment → retries with `PAYMENT-SIGNATURE` header
4. Server settles payment via `settlePayment()` using a Thirdweb server wallet as facilitator
5. On success, job is dispatched to the Railway backend and polled until complete
6. Results displayed as rich property cards with photos, prices, AI scores and highlights

**Key implementation notes:**
- Uses x402 v2 protocol (header: `PAYMENT-SIGNATURE`, challenge: `PAYMENT-REQUIRED`)
- ECDSA signature normalization needed for Avalanche Fuji compatibility (`createNormalizedFetch`)
- Async job pattern: POST creates job → poll GET `/api/search/[jobId]` → `status: "done"` → `result.properties`

**Setup:**

```bash
cd x402-starter-kit
pnpm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY,
# THIRDWEB_SERVER_WALLET_ADDRESS, MERCHANT_WALLET_ADDRESS
pnpm dev
```

---

### `8004-boilerplate/` — ERC-8004 Agent Identity

Boilerplate for registering AI agents on-chain with verifiable identity, reputation, and validation using the ERC-8004 standard on Avalanche Fuji.

**ERC-8004 registries:**

| Registry | Purpose |
|----------|---------|
| Identity | NFT-based agent IDs with metadata |
| Reputation | Immutable client feedback & ratings |
| Validation | Third-party capability verification |

**Setup:**

```bash
cd 8004-boilerplate
npm install
cp .env.example .env
# Add your private key
npm run deploy:fuji
```

See [8004-boilerplate/README.md](./8004-boilerplate/README.md) for full details.

---

## Avalanche Fuji details

| Item | Value |
|------|-------|
| Chain ID | 43113 |
| USDC address | `0x5425890298aed601595a70AB815c96711a31Bc65` |
| Explorer | https://testnet.snowtrace.io |
| Faucet | https://faucet.avax.network |

---

## Hackathon

Built at **Aleph Hackathon** — Avalanche track.
