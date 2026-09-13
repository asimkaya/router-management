import { motion } from "framer-motion";
import { useSessionStore } from "../../app/session-store";

function formatLease(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return "Static / permanent";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function DevicesScreen() {
  const devices = useSessionStore((s) => s.devices);
  const loadingDevices = useSessionStore((s) => s.loadingDevices);
  const refreshDevices = useSessionStore((s) => s.refreshDevices);
  const disconnect = useSessionStore((s) => s.disconnect);
  const host = useSessionStore((s) => s.host);
  const error = useSessionStore((s) => s.error);
  const activeCount = devices.filter((d) => d.active).length;

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm font-medium tracking-[0.16em] text-[var(--accent)] uppercase">
            RouterDesk
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">Devices</h1>
          <p className="mt-2 text-[var(--muted)]">
            Connected to <span className="mono text-[var(--ink)]">{host}</span>
            {" · "}
            {activeCount} active / {devices.length} total
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void refreshDevices()}
            className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-2.5 font-medium transition hover:border-[var(--accent)]"
          >
            {loadingDevices ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => void disconnect()}
            className="rounded-2xl bg-[var(--ink)] px-4 py-2.5 font-medium text-[var(--paper)] transition hover:bg-[var(--accent)]"
          >
            Sign out
          </button>
        </div>
      </motion.header>

      {error ? (
        <p className="mb-4 rounded-2xl bg-[rgba(180,35,24,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3">
        {devices.map((device, index) => (
          <motion.article
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="grid grid-cols-1 items-center gap-3 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] px-5 py-4 shadow-[0_10px_30px_rgba(16,35,31,0.05)] backdrop-blur-md md:grid-cols-[1.4fr_1fr_1fr_auto]"
          >
            <div>
              <h2 className="text-lg font-semibold">{device.hostName}</h2>
              <p className="mono mt-1 text-sm text-[var(--muted)]">
                {device.macAddress || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                IP address
              </p>
              <p className="mono mt-1 text-sm">{device.ipAddress || "—"}</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                Lease
              </p>
              <p className="mt-1 text-sm">{formatLease(device.leaseTimeRemaining)}</p>
            </div>
            <div
              className={`justify-self-start rounded-full px-3 py-1 text-sm font-medium md:justify-self-end ${
                device.active
                  ? "bg-[rgba(20,122,69,0.12)] text-[var(--ok)]"
                  : "bg-[rgba(16,35,31,0.06)] text-[var(--muted)]"
              }`}
            >
              {device.active ? "Online" : "Offline"}
            </div>
          </motion.article>
        ))}

        {!loadingDevices && devices.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/40 px-5 py-10 text-center text-[var(--muted)]">
            No DHCP clients returned by the modem.
          </div>
        ) : null}
      </div>
    </div>
  );
}
