# Agent guide (RouterDesk)

This file is for humans and coding agents (Cursor, Claude Code, etc.).

## Mission

Build a polished open-source **desktop** router manager. Current production target is **TP-Link VX220-G2u** on the local LAN.

## Non-negotiables

1. Do not remove or bypass the `RouterDriver` interface.
2. Do not put CGI payloads inside React components.
3. Do not add cloud sync, accounts, or telemetry without an explicit request.
4. Do not commit secrets, HARs, or `.research` dumps.
5. Prefer extending `src/core/router` over reinventing HTTP in the UI.
6. Keep MVP working: **login + device list**.

## Where to change what

| Goal | Location |
| --- | --- |
| New modem model | `src/core/router/<model>/` + register in `src/core/router/index.ts` |
| HTTP/cookies/Referer issues | `src-tauri/src/http_bridge.rs` |
| Login UI | `src/features/auth/` |
| Device list UI | `src/features/devices/` |
| Session orchestration | `src/app/session-store.ts` |
| Visual language | `src/styles/global.css` + feature components |

## Design constraints

- Distinctive typography (Outfit + IBM Plex Mono already chosen).
- Avoid generic “AI dashboard” purple gradients.
- Motion should clarify navigation, not decorate everything.
- Desktop-first layouts; readable denser data is OK.

## Verification checklist before finishing a task

- [ ] `npm run typecheck` passes
- [ ] App still boots with `npm run tauri dev`
- [ ] Login path still compiles
- [ ] Device list path still compiles
- [ ] No credentials written to the repo

## When unsure

Propose a short plan first for anything that:
- changes auth/crypto
- writes modem settings (block/QoS)
- renames public APIs
- adds dependencies with native/network impact
