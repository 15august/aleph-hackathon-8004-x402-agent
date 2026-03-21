# ERC-8004 Agent Boilerplate

A ready-to-use boilerplate for deploying AI agents with [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) on-chain identity, reputation, and validation.

## What is ERC-8004?

ERC-8004 provides a trust layer for AI agents through three on-chain registries:

| Registry | Purpose |
|----------|---------|
| **Identity** | NFT-based agent IDs with metadata |
| **Reputation** | Immutable client feedback & ratings |
| **Validation** | Third-party capability verification |

## Quick Start

### 1. Install Dependencies

```bash
# Install contract dependencies
npm install

# Install backend dependencies
cd agent-backend && npm install && cd ..
```

### 2. Configure Your Agent

Edit `config/agent.config.js`:

```javascript
module.exports = {
  agent: {
    name: "My AI Agent",
    description: "Your agent description",
    metadataURI: "ipfs://YOUR_METADATA_HASH",
  },
  tasks: {
    types: [
      { id: 0, name: "Text Summarization", price: "0.001" },
      // Add your task types...
    ],
  },
  // ...
};
```

### 3. Set Environment Variables

```bash
cp .env.example .env
# Edit .env with your private key
```

### 4. Deploy Contracts

```bash
# Deploy to Avalanche Fuji testnet
npm run deploy:fuji

# Or deploy locally
npm run node          # Terminal 1
npm run deploy:local  # Terminal 2
```

### 5. Add Your AI Logic

Edit `agent-backend/handlers.js`:

```javascript
async summarize(input) {
  // Call your AI API here
  const response = await fetch('https://api.openai.com/v1/...', {
    // your implementation
  });

  return {
    output: response.result,
    outputURI: `ipfs://${uploadedHash}`,
  };
}
```

### 6. Start the Agent Backend

```bash
cd agent-backend
npm start
```

### 7. Launch Frontend

```bash
cd frontend
python3 -m http.server 3003
# Open http://localhost:3003
```

## Project Structure

```
├── config/
│   └── agent.config.js      # Agent configuration
├── contracts/
│   ├── IdentityRegistry.sol # ERC-8004 Identity
│   ├── ReputationRegistry.sol # ERC-8004 Reputation
│   ├── ValidationRegistry.sol # ERC-8004 Validation
│   └── TaskAgent.sol        # Your agent contract
├── agent-backend/
│   ├── index.js             # Backend service
│   └── handlers.js          # YOUR AI LOGIC HERE
├── frontend/
│   └── index.html           # User interface
├── scripts/
│   └── deploy.js            # Deployment script
└── test/
    └── TaskAgent.test.js    # Tests
```

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  TaskAgent   │────▶│ Agent Backend   │
│   (User)    │     │  (On-Chain)  │     │ (Your AI Logic) │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                   │                      │
       │                   ▼                      │
       │           ┌──────────────┐               │
       │           │   ERC-8004   │               │
       │           │  Registries  │               │
       │           └──────────────┘               │
       │                   │                      │
       ▼                   ▼                      ▼
  Submit Task ───▶ Stored On-Chain ───▶ Backend Processes
       │                   │                      │
       │                   ▼                      │
       │           Task Completed ◀──────────────┘
       │                   │
       ▼                   ▼
  Give Feedback ──▶ Reputation Updated
```

## Task Flow

1. **User submits task** with payment via frontend
2. **Backend polls** for new pending tasks
3. **Backend processes** task using your AI handlers
4. **Backend completes** task on-chain with output hash
5. **User verifies** output and gives feedback
6. **Feedback stored** permanently in Reputation Registry

## Customization

### Adding New Task Types

1. Update `config/agent.config.js`:
```javascript
tasks: {
  types: [
    // ... existing types
    { id: 5, name: "Image Generation", price: "0.05" },
  ],
}
```

2. Add handler in `agent-backend/handlers.js`:
```javascript
async imageGeneration(input) {
  // Your image generation logic
  return { output, outputURI };
}
```

3. Update `taskTypeHandlers` mapping:
```javascript
const taskTypeHandlers = {
  // ... existing handlers
  5: handlers.imageGeneration,
};
```

### Using Existing Registries

To connect to existing ERC-8004 registries (e.g., shared registries on mainnet):

```javascript
// config/agent.config.js
networks: {
  avalanche: {
    registries: {
      identity: "0x...",    // Existing registry address
      reputation: "0x...",
      validation: "0x...",
    },
  },
}
```

### Integrating with AI APIs

Example OpenAI integration in handlers:

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async summarize(input) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Summarize the following text concisely." },
      { role: "user", content: input }
    ],
  });

  const output = completion.choices[0].message.content;
  return {
    output,
    outputURI: `data:text/plain,${encodeURIComponent(output)}`,
  };
}
```

## Deployment Checklist

- [ ] Configure `config/agent.config.js`
- [ ] Add private key to `.env`
- [ ] Get testnet tokens from [faucet](https://faucet.avax.network/)
- [ ] Run `npm run deploy:fuji`
- [ ] Add AI logic to `agent-backend/handlers.js`
- [ ] Start backend with `npm start`
- [ ] Test via frontend

## Network Support

| Network | Chain ID | Status |
|---------|----------|--------|
| Avalanche Fuji | 43113 | Supported |
| Avalanche Mainnet | 43114 | Supported |
| Any EVM Chain | - | Compatible |

## Resources

- [EIP-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [Awesome ERC-8004](https://github.com/sudeepb02/awesome-erc8004)
- [Avalanche Docs](https://docs.avax.network/)
