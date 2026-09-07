Blog backend (standalone)

Quick start

1. copy .env.example to .env and set values
2. npm install
3. Create DB and run SQL in sql/create_tables.sql
4. If upgrading an existing database, run sql/migrations/001_story_content.sql once
5. npm run dev

To load repeatable development content:

```bash
npm run seed
```

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
