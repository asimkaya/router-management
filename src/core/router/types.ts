export type RouterModelId = "vx220-g2u";

export interface RouterCredentials {
  host: string;
  username: string;
  password: string;
}

export interface ConnectedDevice {
  id: string;
  hostName: string;
  macAddress: string;
  ipAddress: string;
  active: boolean;
  leaseTimeRemaining: number;
}

export interface RouterStatusSummary {
  modelName: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
}

export interface RouterDriver {
  readonly id: RouterModelId;
  readonly displayName: string;
  connect(credentials: RouterCredentials): Promise<void>;
  disconnect(): Promise<void>;
  listDevices(): Promise<ConnectedDevice[]>;
}
