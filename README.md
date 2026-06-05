# SumoBubble

Monorepo for the SumoBubble chat bubble tool.

## Layout

- [apps/service](apps/service) — Next.js admin console + API (the backend)
- [apps/wc](apps/wc) — Vue 3 embeddable web component (the bubble itself)

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 11+

## Setup

```bash
pnpm install
```

## Common commands

```bash
# Run the service (Next.js, port 3000)
pnpm dev:service

# Run the web component (Vite, port 3001)
pnpm dev:wc

# Build everything
pnpm build

# Test everything
pnpm test
```

App-specific scripts live in each app's `package.json` and can be invoked with:

```bash
pnpm --filter sumobubble-service <script>
pnpm --filter sumobubble-app <script>
```

## History

This repo was assembled from two prior repos via `git subtree`:

- `monkeytroy/sumobubble-app-service` → `apps/service`
- `monkeytroy/sumobubble-app-wc` → `apps/wc`

Full history from both is preserved in `git log`.
