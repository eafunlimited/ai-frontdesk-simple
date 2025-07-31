# AI Front Desk (Simple Demo)

This repository contains a simple booking and voice receptionist demo built with **Next.js 14** and **TypeScript**. It demonstrates how to collect a small deposit via Stripe and how to offer a voice‑driven interface powered by the OpenAI Realtime API.

## Monorepo layout

```
ai-frontdesk-simple/
  apps/web/            – Next.js 14 + TypeScript app
    app/               – routes: /, /booking, /call, /success, /api/*
    lib/               – shared helpers (Stripe, booking, OpenAI)
    components/        – UI components
    .env.example       – template for environment variables
  netlify.toml         – Netlify configuration
  README.md            – this file
```

Further details about running locally, editing time slots and switching between demo/real mode are provided later.
