# zingo-wrapper

A starter wrapper API around `zingo-cli` (quick path) with a TypeScript SDK and demo. Built for rapid prototyping: Express + TypeScript + Vitest.

> NOTE: Confirm `zingo-cli` flags on your machine: run `zingo-cli --help` and adjust `src/services/adapters/zingoCliAdapter.ts` if needed.

## Quickstart

1. Copy `.env.example` -> `.env` and edit.
2. Install:
   ```bash
   npm ci
3. Start dev server
```javascript
npm run dev
```
4. Use the SDK in packages/zingo-skd
- POST /wallets -> create wallet
- GET /wallets/:id/balance -> balance

5. Tests
```javascript
npm test
```
