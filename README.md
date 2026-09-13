# RouterDesk

Open-source desktop app for managing home modem/routers with a calm, modern UI.

> **MVP focus:** sign in to a **TP-Link VX220-G2u** on your local network and list connected devices.
> The repository stays private for now while the foundation stabilizes; the project is structured for public open-source release.

## Why

Stock modem admin pages are hard to read. RouterDesk talks to the same local management interface your browser uses, then presents the data in a clearer desktop experience.

## Stack

| Layer | Choice | Role |
| --- | --- | --- |
| Desktop shell | **Tauri 2** | Native window, secure local HTTP bridge |
| UI | **React 19 + TypeScript + Vite** | Screens and interactions |
| Motion | **Framer Motion** | Intentional transitions |
| Styling | **Tailwind CSS v4** | Design tokens + layout |
| State | **Zustand** | Session + device list |
| Router protocol | **TypeScript drivers** under `src/core/router` | Model-specific login + CGI parsing |
| Native HTTP | **Rust `reqwest`** via Tauri commands | Cookie jar + `Referer` for LAN requests |

No cloud backend. Credentials stay on your machine.

## MVP scope

### In scope now
1. Local login to VX220-G2u (`192.168.1.1` by default)
2. Connected device list (hostname, MAC, IP, online state, lease)

### Planned next (not built yet)
- Per-device block (MAC filter / parental control)
- Bandwidth / QoS rules
- Traffic history charts
- Multi-model driver registry

## Architecture

```text
src/
  app/                 # App-wide state
  features/            # UI features (auth, devices, …)
  core/router/         # Pure protocol + drivers (no React)
  styles/              # Global design tokens
src-tauri/
  src/http_bridge.rs   # Cookie-aware HTTP for LAN modem APIs
```

**Rule of thumb:** router protocol logic lives in TypeScript drivers. Rust only provides a durable HTTP session bridge. UI never embeds CGI strings.

## Development

### Prerequisites
- Node.js 20+
- Rust (stable) + Tauri prerequisites for your OS
- A VX220-G2u reachable on the LAN

### Run

```bash
npm install
npm run tauri dev
```

### Useful scripts

```bash
npm run typecheck
npm run build
npm run tauri build
```

## Security notes

- Use the modem’s **local** admin password.
- Do not commit credentials, HAR captures, or router backups.
- After testing, change any password that was shared in chat or logs.
- Only manage networks you own or are authorized to administer.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [AGENTS.md](./AGENTS.md).
Cursor/agent rules live in [`.cursor/rules/`](./.cursor/rules/).

## License

MIT — see [LICENSE](./LICENSE).
