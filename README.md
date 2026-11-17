# Secure Notes – Frontend

A React client for the Secure Notes API.

Stack: React, TypeScript, Vite, Ant Design (components and icons). No router: views are switched with the top menu.

## Getting started

Requirements: Node.js 22+, pnpm, and the backend running on `http://localhost:4000`.

Copy `env.example` to `.env` and set the backend URL (`.env` is git-ignored):

```
VITE_API_URL=http://localhost:4000
```

Without it, the app uses `http://localhost:4000`. The backend must allow this app's address in its `CLIENT_URL` (default `http://localhost:5173`).

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`. Use `localhost` for both the app and `VITE_API_URL`, not `127.0.0.1` for one of them. The auth cookie is `SameSite=Strict`, so the browser only sends it when both run on the same site.

`pnpm build` type-checks and builds to `dist/`. Vite writes `VITE_API_URL` into the bundle at build time, so set it before building for production.

## Code quality

- `pnpm lint`: ESLint (TypeScript, React hooks)
- `pnpm format` / `pnpm format:check`: Prettier
- A Husky pre-commit hook runs lint-staged, which lints and formats only the staged files.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat(ui): ...`, `fix(auth): ...`). A Husky `commit-msg` hook runs commitlint and rejects any other format. Run `pnpm commit` for a guided prompt (commitizen with `@commitlint/cz-commitlint`).

## What's in it

- **Log in / Register**: the backend keeps both tokens in httpOnly cookies, so this app never reads or stores them. Requests use `credentials: 'include'`. When a request gets a 401 because the 15-minute access token expired, the app calls `/api/auth/refresh` once and retries the request. If several requests fail at the same time, they share one refresh. Only if the refresh fails does the app go back to the login form.
- **My notes**: create, edit, delete, and page through your own notes.
- **Profile & posts**: edit your name and interests, and write posts.
- **Users by interest**: the grouped view. Click a name to open that user's posts.
- **Users** (admin): a table of users, with a dialog to add or edit one (including role and password) and a confirmation before deleting.
- **All notes** (admin): everyone's notes with their owner.

## Structure

```
src/
  api.ts        fetch wrapper and shared types
  main.tsx      Ant Design theme and providers
  usePaged.ts   hook that loads one page of a list
  App.tsx       session handling, layout and menu
  pages/        one component per view
```
