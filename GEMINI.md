# Zed Legends (Music Stream Next)

This document provides a summary of the Zed Legends project, including key technologies, common commands, and development guidelines.

## Project Overview & Status

Zed Legends is a music streaming application built with Next.js. It is currently undergoing a significant refactoring to modernize its architecture and improve maintainability.

**Current State:**
- The custom Node.js server (`server.js`) has been removed.
- The project has been migrated from the `pages` router to the `app` router.
- API logic is now handled by Next.js API Routes in `pages/api/`.
- TypeScript has been introduced and is being rolled out incrementally.
- Prettier has been set up for consistent code formatting.

## User Preferences

- **Refactoring Approach:** The user prefers a structured, phased approach to refactoring. We establish a high-level plan and tackle it incrementally, starting with the most impactful changes.
- **Execution:** The user prefers me to proceed with the planned steps after they have given their approval.
- **Server Execution:** The user is responsible for running the development server (`npm run dev`). I will request the logs to verify changes and diagnose issues.

## Key Technologies

- **Framework:** Next.js 14+ (`app` router)
- **Language:** TypeScript & JavaScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (via Supabase)
- **File Storage:** Cloudflare R2 (S3-compatible)
- **Deployment:** Vercel
- **Code Formatting:** Prettier

## Common Commands

### Development

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

### Production Build

To build the application for production:

```bash
npm run build
```

To run the production build locally:
```bash
npm run start
```

### Code Quality

To check for linting errors:
```bash
npm run lint
```

To automatically format all code:
```bash
npm run format
```

### Utility Scripts

The project contains several utility scripts in the `scripts/` directory. For a full list, see the `scripts` section in `package.json`. Example:

```bash
node scripts/generate-voices.js
```