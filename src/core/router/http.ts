import { invoke } from "@tauri-apps/api/core";

export interface BridgeHttpRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface BridgeHttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  cookies: Record<string, string>;
}

export async function routerHttp(
  request: BridgeHttpRequest,
): Promise<BridgeHttpResponse> {
  return invoke<BridgeHttpResponse>("router_http", { request });
}

export async function clearRouterSession(): Promise<void> {
  await invoke("router_clear_session");
}
