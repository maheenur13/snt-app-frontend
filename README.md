# Secure Notes – Frontend

A React client for the Secure Notes API.

Stack: React, TypeScript, Vite, Ant Design (components and icons). No router: views are switched with the top menu.

## Getting started

Requirements: Node.js 22+, pnpm, and the backend running on `http://localhost:4000`.

Copy `env.example` to `.env` and set the backend URL (`.env` is git-ignored):

```
VITE_API_URL=http://localhost:4000
```

Without it, `pnpm dev` uses `http://localhost:4000`, and a production build calls `/api` on its own origin (see Deployment). The backend must allow this app's address in its `CLIENT_URL` (default `http://localhost:5173`).

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`. Use `localhost` for both the app and `VITE_API_URL`, not `127.0.0.1` for one of them. The auth cookie is `SameSite=Strict`, so the browser only sends it when both run on the same site.

`pnpm build` type-checks and builds to `dist/`, and `pnpm preview` serves that build. Vite writes `VITE_API_URL` into the bundle at build time, so changing it needs a rebuild.

## Code quality

- `pnpm lint`: ESLint (TypeScript, React hooks)
- `pnpm format` / `pnpm format:check`: Prettier
- A Husky pre-commit hook runs lint-staged, which lints and formats only the staged files.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat(ui): ...`, `fix(auth): ...`). A Husky `commit-msg` hook runs commitlint and rejects any other format. Run `pnpm commit` for a guided prompt (commitizen with `@commitlint/cz-commitlint`).

## What's in it

- **Log in / Register**: the backend keeps both tokens in httpOnly cookies, so this app never reads or stores them. Requests use `credentials: 'include'`. When a request gets a 401 because the 15-minute access token expired, the app calls `/api/auth/refresh` once and retries the request. If several requests fail at the same time, they share one refresh. Only if the refresh fails does the app go back to the login form.
- **My notes**: create, edit, delete, and page through your own notes.
- **Profile & posts**: edit your name and interests, and write posts.
- **Users by interest**: one card per interest with the number of users and their names. Click a name to open that user's posts.
- **Users** (admin): a table of users, with a dialog to add or edit one (including role and password), a confirmation before deleting, and a button to open any user's posts (including users with no interests, who don't appear on the Interests page).
- **All notes** (admin): everyone's notes with their owner.

Every list is paginated by the API (10 per page).

## Structure

```
src/
  api.ts        fetch wrapper (cookies, refresh and retry, unwraps the API's { success, data, meta } envelope) and shared types
  main.tsx      Ant Design theme and providers
  usePaged.ts   hook that loads one page of a list
  App.tsx       session handling, layout and menu
  pages/        one component per view
vercel.json     forwards /api to the backend in production
```

## Deployment

The live demo runs on Vercel, with the API on Render (see the backend README).

`vercel.json` rewrites `/api/*` to the Render backend, so the browser calls `/api` on the Vercel domain itself. The auth cookies are then first-party, which `SameSite=Strict` needs: browsers don't send them to a different site like `onrender.com`.

- Import the repo in Vercel. It detects Vite, so the defaults work (`pnpm build`, output `dist`).
- Don't set `VITE_API_URL` on Vercel. If set, the app calls Render directly and login fails because the cookies aren't sent.
- If the backend moves, update the URL in `vercel.json`, and set the backend's `CLIENT_URL` to the Vercel URL.
