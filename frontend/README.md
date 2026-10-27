# Vinext Boilerplate

A simple boilerplate for [Vinext](https://github.com/cloudflare/vinext) — Cloudflare's experimental Vite plugin that reimplements the Next.js API surface (App Router, RSC, Server Actions, middleware) so a Next.js-style app runs on Vite and deploys to Cloudflare Workers.

## What is Vinext?

Vinext is **not** a new framework — it's a Vite plugin that re-implements the public Next.js API (routing, `next/*` imports, App Router, Pages Router, SSR/RSC, Server Actions, middleware, ISR) on top of Vite's build pipeline. You write standard Next.js code (`app/`, `pages/`, `next.config.js` conventions), but it builds with Vite instead of the Next.js compiler, and deploys natively to Cloudflare Workers (with other targets via Nitro).

- Experimental / MIT-licensed, maintained by Cloudflare
- ~94% of the Next.js 16 API surface covered
- Faster builds, smaller bundles than stock Next.js
- Repo: https://github.com/cloudflare/vinext
- Docs: https://vinext.io/

## Stack

- Vinext (Next.js API on Vite)
- TypeScript
- App Router
- Tailwind CSS
- Cloudflare Workers (deploy target)

## Getting Started

Clone and install dependencies:

```bash
git clone https://github.com/Co-Ventech/vinext-boilerplate.git
cd vinext-boilerplate
npm install
```

Run the dev server (http://localhost:3000):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run the built Worker locally (via Wrangler):

```bash
npm run start
```

## Deploying to Cloudflare Workers

1. Authenticate with Cloudflare (skip if already logged in):

   ```bash
   npx wrangler login
   ```

2. Create the KV namespace this app needs (`wrangler.jsonc` ships with a placeholder ID that must be replaced):

   ```bash
   npx wrangler kv namespace create VINEXT_KV_CACHE
   ```

   Copy the returned `id` into the `kv_namespaces` entry in `wrangler.jsonc`, replacing `<your-kv-namespace-id>`.

3. Build and deploy:

   ```bash
   npm run build
   npm run deploy
   ```

   This deploys to `https://<worker-name>.<your-subdomain>.workers.dev`, where `<worker-name>` is the `name` field in `wrangler.jsonc`.

If you don't do step 2, `npm run deploy` will fail because the KV binding has no real namespace ID.

## Project Structure

```
app/                   # App Router routes (standard Next.js conventions)
app/api/hello/route.ts # Example Route Handler
app/layout.tsx         # Root layout
app/page.tsx           # Home page
next.config.ts         # Standard Next.js config conventions (optional)
vite.config.ts         # Vite + vinext + @cloudflare/vite-plugin config
wrangler.jsonc         # Cloudflare Workers config (name, KV binding, assets, images)
```

## Status

This boilerplate was scaffolded with the official `create-vinext-app` generator, targeting Cloudflare Workers, and verified end-to-end: `npm run dev` serves the app locally, and `npm run build && npm run deploy` deploys a working Worker (homepage + `/api/hello` both return correct responses). Vinext itself is experimental — expect gaps versus a full Next.js production app.

## Projects built from this boilerplate

- [vinext-url-shortener](https://github.com/Co-Ventech/vinext-url-shortener) — a URL shortener demo (Cloudflare KV-backed) built on top of this starter
