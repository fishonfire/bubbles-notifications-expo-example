declare module 'bubbles-npm-user-app' {
  export interface RequestOptions {
    token?: string | (() => string | Promise<string>) | null;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  }

  export interface UpdateDeviceOptions extends RequestOptions {
    method?: 'PATCH' | 'PUT';
  }

  export interface DeviceClientOptions {
    baseUrl: string;
    token?: string | (() => string | Promise<string>) | null;
    fetch?: typeof fetch;
    devicePath?: string;
    updateMethod?: 'PATCH' | 'PUT';
    defaultHeaders?: Record<string, string>;
  }

  export class ApiError<TBody = unknown> extends Error {
    status?: number;
    body?: TBody;
    headers?: Headers;
    method?: string;
    url?: string;
  }

  export class DeviceClient {
    constructor(options: DeviceClientOptions);

    createDevice<TResponse = unknown, TBody = Record<string, unknown>>(
      deviceParams: TBody,
      options?: RequestOptions,
    ): Promise<TResponse>;

    updateDevice<TResponse = unknown, TBody = Record<string, unknown>>(
      id: string | number,
      deviceParams: TBody,
      options?: UpdateDeviceOptions,
    ): Promise<TResponse>;

    postDeliveryStatus<TResponse = unknown>(
      deviceId: string,
      notificationId: string,
      payload: { error?: string; status?: string },
      options?: RequestOptions,
    ): Promise<TResponse>;
  }

  export function getLocaleAndTimeZone(): {
    locale: string;
    timeZone: string;
  };

  export function getAppVersion(): string;
}
