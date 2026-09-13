import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "../../app/session-store";

export function LoginScreen() {
  const connect = useSessionStore((s) => s.connect);
  const connecting = useSessionStore((s) => s.connecting);
  const error = useSessionStore((s) => s.error);
  const hostDefault = useSessionStore((s) => s.host);
  const usernameDefault = useSessionStore((s) => s.username);

  const [host, setHost] = useState(hostDefault);
  const [username, setUsername] = useState(usernameDefault);
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await connect({ host, username, password });
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10">
      <motion.div
        className="absolute inset-x-10 top-16 h-40 rounded-full bg-[rgba(15,122,101,0.12)] blur-3xl"
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
            RouterDesk
          </p>
          <h1 className="max-w-xl text-5xl leading-[1.05] font-semibold tracking-tight text-[var(--ink)]">
            Your modem,
            <span className="block text-[var(--accent)]">finally readable.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-[var(--muted)]">
            A calm desktop console for home routers. MVP focuses on signing in
            to your TP-Link VX220-G2u and listing every device on the LAN.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full border border-[var(--line)] bg-white/50 px-3 py-1">
              Local only
            </span>
            <span className="rounded-full border border-[var(--line)] bg-white/50 px-3 py-1">
              Open source
            </span>
            <span className="rounded-full border border-[var(--line)] bg-white/50 px-3 py-1">
              VX220-G2u first
            </span>
          </div>
        </motion.section>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="relative rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-7 shadow-[var(--shadow)] backdrop-blur-md"
        >
          <h2 className="text-2xl font-semibold">Connect to modem</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Uses your local admin credentials. Nothing leaves your network.
          </p>

          <label className="mt-6 block text-sm font-medium">
            Modem address
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="192.168.1.1"
              autoComplete="off"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Username
            <input
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <p className="mt-4 rounded-2xl bg-[rgba(180,35,24,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={connecting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--ink)] px-4 py-3.5 font-medium text-[var(--paper)] transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {connecting ? "Signing in…" : "Sign in"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
