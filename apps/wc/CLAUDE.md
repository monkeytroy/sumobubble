# sumobubble-app (web component)

Embeddable chat bubble. Vue 3 + Vite, built as a single ES module
custom element via `defineCustomElement` and shipped as
`dist/sumobubble.js`.

## Embed

```html
<script type="module"
  src="https://{host}/wc/sumobubble.js"
  id="sumobubble-app-scriptastic"></script>
<sumobubble-wc site="SITE_ID"></sumobubble-wc>
```

Fetches `${VITE_SITES_BASE_URL}/{SITE_ID}.json` (default = prod
DigitalOcean Spaces, see [.env.example](.env.example)) and renders
the bubble.

## Shadow DOM

The bubble lives in a shadow root (Vue's `defineCustomElement`
default). This isolates styles from the host page. **Don't switch
to `shadowRoot: false`** — the embedded model assumes the bubble
won't leak styles into / inherit styles from the host.

## Stack

- Vue 3.5, Vite 8, Vitest 4
- Tailwind 3.4 + `@tailwindcss/forms` (kept on v3 because v4's
  utilities rely on document-scope `@property` defaults that
  don't reach shadow roots; v3 emits self-contained CSS that
  just works inside the shadow DOM)
- ESLint 9 flat config + Prettier
- Runtime accent colors come from the customer config: App.ce.vue
  sets `--color-primary` / `--color-a11y` on the host element via
  `:style="cssRootString"` and the Tailwind config maps those to
  `skin.primary` / `skin.a11y` via the `withOpacity` helper.
  See [tailwind.config.cjs](tailwind.config.cjs).

## Dev / build / test

```sh
pnpm dev             # vite build --watch + http-server on :3001 — serves
                     # the rebuilt dist/sumobubble.js. Use this when the
                     # console preview ('apps/service' under /console)
                     # needs to load the bundle, or when running the full
                     # monorepo via `pnpm dev` at the root.
pnpm dev:hmr         # vite dev w/ HMR — faster iteration when working on
                     # the wc in isolation (entry: index.html). No
                     # /sumobubble.js URL exists in this mode, so the
                     # service console preview won't find the bundle.
pnpm build           # prod bundle -> dist/sumobubble.js
pnpm preview:bundle  # one-shot build + serve dist (no watch)
pnpm test            # vitest, src/**/*.test.ts
pnpm lint            # eslint
pnpm format          # prettier --write .
```

The two pages under [public/](public/) preview the actual built
bundle (one against local, one against the deployed prod URL).
