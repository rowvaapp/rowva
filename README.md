# DB Enricher — Gmail ↔ Notion (Next.js + TypeScript + Tailwind)

A Notion-like UI that **reads labeled Gmail** and **creates/updates pages** in a **Notion database**, with field extraction and a **Format Designer (lite)**.

## Quick start

```bash
# install deps (choose one)
pnpm install   # or
npm install    # or
yarn install

cp .env.example .env

# initialize database (SQLite via DATABASE_URL)
npm run prisma:dev

# start dev server
npm run dev
```

Set OAuth secrets and the Notion DB ID in `.env` (DATABASE_URL is used by Prisma), then:

- Connect Gmail & Notion from the home page.
- Use `/setup` to view databases and copy the DB ID.
- Click **Run Import** to ingest the last 7 days for your label.

## Differentiators

- Deterministic parsing + confidence score
- Format Designer (regex/anchor/kv) preview
- Idempotent Notion upserts by Gmail messageId

MIT

## Deployment and Env

Never commit real secrets. `.env` is ignored by git.

1. Copy `.env.example` to `.env` and fill values locally.
2. In production, set env vars via your host:
	- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI
	- NOTION_CLIENT_ID / NOTION_CLIENT_SECRET / NOTION_REDIRECT_URI
	- DATABASE_URL
	- CRON_SECRET
	- NEXT_PUBLIC_APP_URL
	- GMAIL_PUBSUB_TOPIC (projects/<project-id>/topics/<topic-name>)

### Gmail Push (no polling)

1. Create a Pub/Sub topic and a PUSH subscription to `https://YOUR_DOMAIN/api/gmail/push`.
2. Grant `gmail-api-push@system.gserviceaccount.com` the `roles/pubsub.publisher` on that topic.
3. Set `GMAIL_PUBSUB_TOPIC` in your env.
4. Connect Gmail in the app; watch auto-starts. Or POST `/api/gmail/watch` manually.
