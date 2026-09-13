import { create } from "zustand";
import { createRouterDriver } from "../core/router";
import type {
  ConnectedDevice,
  RouterCredentials,
  RouterDriver,
  RouterModelId,
} from "../core/router";

interface SessionState {
  modelId: RouterModelId;
  driver: RouterDriver | null;
  connected: boolean;
  connecting: boolean;
  loadingDevices: boolean;
  devices: ConnectedDevice[];
  error: string | null;
  host: string;
  username: string;
  connect: (credentials: RouterCredentials) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  modelId: "vx220-g2u",
  driver: null,
  connected: false,
  connecting: false,
  loadingDevices: false,
  devices: [],
  error: null,
  host: "192.168.1.1",
  username: "admin",

  clearError: () => set({ error: null }),

  connect: async (credentials) => {
    set({ connecting: true, error: null });
    const driver = createRouterDriver(get().modelId);
    try {
      await driver.connect(credentials);
      set({
        driver,
        connected: true,
        connecting: false,
        host: credentials.host,
        username: credentials.username,
      });
      await get().refreshDevices();
    } catch (error) {
      set({
        connecting: false,
        connected: false,
        driver: null,
        error: error instanceof Error ? error.message : "Connection failed",
      });
      throw error;
    }
  },

  disconnect: async () => {
    const { driver } = get();
    if (driver) {
      await driver.disconnect();
    }
    set({
      driver: null,
      connected: false,
      devices: [],
      error: null,
    });
  },

  refreshDevices: async () => {
    const { driver, connected } = get();
    if (!driver || !connected) {
      return;
    }
    set({ loadingDevices: true, error: null });
    try {
      const devices = await driver.listDevices();
      set({ devices, loadingDevices: false });
    } catch (error) {
      set({
        loadingDevices: false,
        error: error instanceof Error ? error.message : "Failed to load devices",
      });
    }
  },
}));
