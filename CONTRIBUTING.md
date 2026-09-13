# Contributing to RouterDesk

Thanks for helping. This project is intentionally small and strict so new features do not break the VX220 MVP.

## Ground rules

1. **One vertical slice at a time.** Prefer finishing a thin feature (read or write) over scaffolding many unfinished screens.
2. **Do not break existing drivers.** VX220 login + device list must keep working.
3. **No credentials in git.** Never commit passwords, session cookies, HAR files, or config backups.
4. **Driver isolation.** Model-specific CGI/auth code belongs in `src/core/router/<model>/`.
5. **UI isolation.** React components must not call modem HTTP directly; go through the session store / driver API.

## Local setup

```bash
npm install
npm run tauri dev
```

## Pull requests

- Keep PRs focused.
- Update README/AGENTS when architecture changes.
- Add or adjust Cursor rules if you introduce a new convention.
- Describe how you tested against a real modem when relevant.

## Code style

- TypeScript strict mode; avoid `any`.
- Prefer explicit types at driver boundaries.
- Keep comments rare and useful.
- English for code, docs, and commit messages.
