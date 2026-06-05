# SumoBubble

Monorepo for the SumoBubble chat bubble tool.

## Layout

- [apps/service](apps/service) — Next.js admin console + API (the backend)
- [apps/wc](apps/wc) — Vue 3 embeddable web component (the bubble itself)
- [infra](infra) — local dev infrastructure (MongoDB + Redis via docker compose)

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 11+
- [Docker](https://www.docker.com/) (for the local Mongo + Redis)

## Setup

```bash
pnpm install
```

## Run everything

Make sure Docker is running, then:

```bash
pnpm dev
```

This uses [Turborepo](https://turbo.build/) to run **all three** in parallel:
- `infra` — `docker compose up` (Mongo on 27017, Redis on 6379)
- `apps/service` — Next.js on 3000
- `apps/wc` — Vite build + http-server on 3001

Mongo connection string for the service:
`mongodb://admin:password@localhost:27017/sumobubble-dev?authSource=admin`

`Ctrl+C` shuts everything down (including the docker containers, since `docker compose up` runs in the foreground).

## Run things individually

```bash
pnpm dev:service   # just Next
pnpm dev:wc        # just the web component
pnpm dev:infra     # just docker compose

pnpm infra:stop    # stop containers (keep volumes)
pnpm infra:reset   # stop containers AND wipe Mongo data
```

## Other turbo tasks

```bash
pnpm build   # turbo run build  -> builds every app
pnpm test    # turbo run test   -> runs every app's tests
pnpm lint    # turbo run lint
```

App-specific scripts can also be invoked directly:

```bash
pnpm --filter sumobubble-service <script>
pnpm --filter sumobubble-app <script>
pnpm --filter @sumobubble/infra <script>
```

## History

This repo was assembled from two prior repos via `git subtree`:

- `monkeytroy/sumobubble-app-service` → `apps/service`
- `monkeytroy/sumobubble-app-wc` → `apps/wc`

Full history from both is preserved in `git log`.
