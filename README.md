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

### Third-party accounts

The service is wired to several external providers. Only Auth0 is required
to boot; the rest gate individual features and can be left blank.

| Service | Used for | Required? |
| --- | --- | --- |
| [Auth0](https://auth0.com) | sign-in | yes — free tier covers up to 7k users |
| [MongoDB](https://www.mongodb.com) | data | local via docker, or [Atlas](https://www.mongodb.com/atlas) free M0 in prod |
| [Google AI Studio](https://aistudio.google.com) | Ask AI (Gemini) | optional, free tier available |
| [Stripe](https://stripe.com) | subscriptions | optional |
| [reCAPTCHA v3](https://www.google.com/recaptcha/admin) | contact-form spam | optional |
| SMTP (e.g. Gmail App Password) | contact-form delivery | optional |
| S3-compatible bucket (e.g. DigitalOcean Spaces, AWS S3) | publishing site JSON | only in production — dev writes to disk |

## Setup

```bash
pnpm install
```

Copy each app's `.env.example` to `.env` and fill in:

```bash
cp apps/service/.env.example apps/service/.env
cp apps/wc/.env.example apps/wc/.env
```

See the comments in each example file for what each variable does.

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

## License

MIT — see [LICENSE](LICENSE).

## History

This repo was assembled from two prior repos via `git subtree`:

- `monkeytroy/sumobubble-app-service` → `apps/service`
- `monkeytroy/sumobubble-app-wc` → `apps/wc`

Full history from both is preserved in `git log`.
