import { clearRouterSession, routerHttp } from "../http";
import type {
  ConnectedDevice,
  RouterCredentials,
  RouterDriver,
} from "../types";
import { buildActGl, parseCgiResponse } from "./cgi";
import { rsaEncryptToHex, tpLinkBase64 } from "./crypto";

function normalizeHost(host: string): string {
  const trimmed = host.trim().replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `http://${trimmed}`;
}

function mapDevice(stack: string, fields: Record<string, string>): ConnectedDevice {
  const hostName = fields.hostName?.trim() || "Unknown device";
  return {
    id: `${fields.MACAddress ?? stack}-${fields.IPAddress ?? "0"}`,
    hostName:
      hostName.toUpperCase() === "UNKOWN HOST" || hostName === "Unknown"
        ? "Unknown device"
        : hostName,
    macAddress: (fields.MACAddress ?? "").toUpperCase(),
    ipAddress: fields.IPAddress ?? "",
    active: fields.active === "1" || fields.Active === "1",
    leaseTimeRemaining: Number(fields.leaseTimeRemaining ?? 0),
  };
}

export class Vx220Driver implements RouterDriver {
  readonly id = "vx220-g2u" as const;
  readonly displayName = "TP-Link VX220-G2u";

  private baseUrl = "http://192.168.1.1";

  async connect(credentials: RouterCredentials): Promise<void> {
    await clearRouterSession();
    this.baseUrl = normalizeHost(credentials.host);

    const parm = await routerHttp({
      method: "POST",
      url: `${this.baseUrl}/cgi/getParm`,
      headers: {
        Referer: `${this.baseUrl}/`,
      },
    });

    if (parm.status !== 200) {
      throw new Error(`Failed to fetch auth parameters (${parm.status})`);
    }

    const nn = parm.body.match(/var nn="([0-9A-Fa-f]+)"/)?.[1];
    const ee = parm.body.match(/var ee="([0-9A-Fa-f]+)"/)?.[1];
    if (!nn || !ee) {
      throw new Error("Router did not return RSA parameters");
    }

    const encUser = rsaEncryptToHex(
      tpLinkBase64(credentials.username),
      nn,
      ee,
    );
    const encPass = rsaEncryptToHex(
      tpLinkBase64(credentials.password),
      nn,
      ee,
    );

    const login = await routerHttp({
      method: "POST",
      url: `${this.baseUrl}/cgi/login?UserName=${encUser}&Passwd=${encPass}&Action=1&LoginStatus=0`,
      headers: {
        Referer: `${this.baseUrl}/`,
      },
    });

    if (login.status !== 200) {
      throw new Error(`Login request failed (${login.status})`);
    }

    const ret = login.body.match(/\$\.ret=(-?\d+)/)?.[1];
    if (ret === "71233") {
      throw new Error("Incorrect username or password");
    }
    if (ret && ret !== "0") {
      throw new Error(`Login rejected by router (code ${ret})`);
    }
    if (!login.cookies.JSESSIONID && !Object.keys(login.cookies).length) {
      // Some firmwares still succeed with Set-Cookie parsed into jar;
      // if ret is 0 we continue.
      if (ret !== "0") {
        throw new Error("Login did not establish a session");
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      await routerHttp({
        method: "POST",
        url: `${this.baseUrl}/cgi/logout`,
        headers: { Referer: `${this.baseUrl}/` },
      });
    } catch {
      // Best-effort logout.
    }
    await clearRouterSession();
  }

  async listDevices(): Promise<ConnectedDevice[]> {
    const body = buildActGl("LAN_HOST_ENTRY", [
      "leaseTimeRemaining",
      "MACAddress",
      "hostName",
      "IPAddress",
      "Active",
    ]);

    const response = await routerHttp({
      method: "POST",
      url: `${this.baseUrl}/cgi?5`,
      headers: {
        Referer: `${this.baseUrl}/`,
        "Content-Type": "text/plain",
      },
      body,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to list devices (${response.status})`);
    }

    if (
      response.body.includes("500 Internal Server Error") ||
      response.body.includes("403 Forbidden")
    ) {
      throw new Error("Session expired. Please sign in again.");
    }

    return parseCgiResponse(response.body)
      .filter((obj) => obj.fields.MACAddress || obj.fields.IPAddress)
      .map((obj) => mapDevice(obj.stack, obj.fields))
      .sort((a, b) => Number(b.active) - Number(a.active) || a.ipAddress.localeCompare(b.ipAddress));
  }
}

export function createVx220Driver(): RouterDriver {
  return new Vx220Driver();
}
