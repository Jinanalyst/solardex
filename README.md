# Solana DEX

A decentralized exchange built on the Solana blockchain.

## Features

- Token swapping with automated market maker (AMM)
- Liquidity pool management
- Real-time price updates
- Wallet integration (Phantom)
- Low transaction fees
- Fast transaction confirmation

## Prerequisites

- Node.js 16+ and npm
- Rust and Cargo
- Solana CLI tools
- Anchor framework

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Install Solana CLI tools:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
```

4. Install Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Build the project:
```bash
npm run build
```

## Testing

```bash
npm test
```

## License

MIT
