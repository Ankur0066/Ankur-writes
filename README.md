Blog backend (standalone)

Quick start

1. copy .env.example to .env and set values
2. npm install
3. Create DB and run SQL in sql/create_tables.sql
4. If upgrading an existing database, run sql/migrations/001_story_content.sql and sql/migrations/002_post_image_url.sql once
5. npm run dev

To load repeatable development content:

```bash
npm run seed
```

## Deploying to Vercel

This project includes a Vercel serverless entrypoint at `api/index.js`.

1. Push the backend branch to GitHub.
2. Import the repository in Vercel and select the backend branch.
3. If the repository contains multiple projects, set the Vercel Root Directory
   to this backend folder.
4. Add the variables from `.env.example` in the Vercel project settings.
   Configure a hosted MySQL database; `127.0.0.1` is not available on Vercel.
   You may provide the provider's `DATABASE_URL`, or set `DB_HOST`, `DB_PORT`,
   `DB_USER`, `DB_PASS`, and `DB_NAME` individually.
5. Set `FRONTEND_ORIGIN` to the deployed frontend URL. Multiple origins may be
   separated with commas.
6. Deploy. The API base URL is:

   `https://your-project.vercel.app/api`

Set that URL as the frontend `VITE_API_BASE_URL` and redeploy the frontend.

Run database migrations against the hosted MySQL database before using the
deployed API. Do not commit `.env` or database credentials.

If `/api/posts` returns `ECONNREFUSED`, the Vercel deployment cannot connect to
the configured database. Check the Vercel Production environment variables,
database allowlist/network access, and SSL settings (`DB_SSL=true` when
required), then redeploy.

The seed creates three published stories, one draft story, structured blocks,
categories, tags, and updates existing rows by slug instead of duplicating them.

Features
- JWT (email/password) authentication
- Admin bootstrap from ADMIN_EMAIL/ADMIN_PASSWORD env
- Posts CRUD with structured content blocks (paragraph, heading, code, diagram, image, quote, divider)
- ImgBB media upload
- Anonymous comments
- Contact form sending emails (nodemailer) and saving to inbox_entries

## Story API

Public stories are available through `GET /api/posts/:slug`. Published stories are
hidden until `publish_at` is reached. The response includes metadata, author,
category, tags, and ordered content blocks for the frontend renderer.

Admin post creation accepts a body like:

```json
{
  "title": "A software factory needs one sandbox per agent",
  "summary": "How isolated environments help agents work together.",
  "image_url": "https://example.com/story-cover.jpg",
  "category": "Engineering",
  "tags": ["AI engineering", "Sandboxes"],
  "status": "draft",
  "blocks": [
    { "type": "paragraph", "data": { "text": "Story introduction." } },
    { "type": "heading", "data": { "text": "A section", "level": 2 } },
    { "type": "code", "data": { "language": "typescript", "filename": "example.ts", "code": "const ready = true" } }
  ]
}
```
