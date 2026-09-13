import { createVx220Driver } from "./vx220/client";
import type { RouterDriver, RouterModelId } from "./types";

const drivers: Record<RouterModelId, () => RouterDriver> = {
  "vx220-g2u": createVx220Driver,
};

export function createRouterDriver(modelId: RouterModelId): RouterDriver {
  const factory = drivers[modelId];
  if (!factory) {
    throw new Error(`Unsupported router model: ${modelId}`);
  }
  return factory();
}

export * from "./types";
