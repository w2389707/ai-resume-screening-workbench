# AI Resume Screening Workbench

A Next.js app for batch AI-resume screening. Recruiters can upload PDF and `.docx` resumes, review extracted AI-related evidence, override system labels, and export the current batch view to Excel.

## What is included

- Batch upload for text-based `PDF` and `.docx` resumes
- Rule-based analysis by default, with optional OpenAI-backed analysis
- Resume workbench with batch summary, filters, evidence detail, and recruiter overrides
- Excel export for the current filtered candidate list
- SQLite + local upload storage for simple local deployment

## Requirements

- Node.js 20+
- npm 10+

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create a local environment file

```bash
copy .env.example .env
```

3. Initialize the local database

```bash
npm run db:push
```

4. Start the development server

```bash
npm run dev
```

5. Open the app

```text
http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env` and adjust values if needed.

```env
DATABASE_URL="file:./dev.db"
UPLOAD_DIR=".data/uploads"
ANALYZER_MODE="rules"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
```

### Analyzer modes

- `rules`: local rules-based AI relevance extraction. No API key required.
- `openai`: sends parsed resume text to the OpenAI API. Set `OPENAI_API_KEY` before using this mode.

## Common commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:e2e
```

## Production-style local run

```bash
npm install
copy .env.example .env
npm run db:push
npm run build
npm run start
```

The app stores uploaded files in `.data/uploads` and uses a local SQLite database. Those runtime files are intentionally ignored by git.

## Notes

- V1 supports text-based PDFs and `.docx` files. Scanned PDFs are not supported.
- If you share this repo publicly, do not commit `.env`, `.data`, or any local database files.
- For external trials, a proper server deployment is better than exposing a local machine through a temporary tunnel.
