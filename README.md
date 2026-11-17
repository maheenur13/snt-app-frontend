# Secure Notes – Frontend

A minimal React client for the Secure Notes API. The focus is functionality, not styling.

Stack: React, TypeScript, Vite. No router or UI library.

## Getting started

Requirements: Node.js 22+, pnpm, and the backend running on `http://localhost:4000`.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend (see `vite.config.ts`), so no CORS setup is needed.

`pnpm build` type-checks and builds to `dist/`.

## Code quality

- `pnpm lint`: ESLint (TypeScript, React hooks)
- `pnpm format` / `pnpm format:check`: Prettier
- A Husky pre-commit hook runs lint-staged, which lints and formats only the staged files.

## What's in it

- **Log in / Register**: stores the JWT in `localStorage` and sends it as a `Bearer` token.
- **My notes**: create, edit, delete, and page through your own notes.
- **Profile & posts**: edit your name and interests, and write posts.
- **Users by interest**: the grouped view. Click a name to open that user's posts.
- **Manage users** (admin): list, add, edit (including role and password), and delete users.
- **All notes** (admin): everyone's notes with their owner.

## Structure

```
src/
  api.ts        fetch wrapper and shared types
  usePaged.ts   hook that loads one page of a list
  Pager.tsx     previous/next page controls
  App.tsx       session handling and tab navigation
  pages/        one component per view
```
