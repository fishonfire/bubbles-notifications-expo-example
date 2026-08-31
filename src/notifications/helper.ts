import { File, Paths } from 'expo-file-system';
import { DeviceClient } from 'bubbles-npm-user-app';
import { Platform } from 'react-native';

const DEVICE_ID_FILE_NAME = 'device-id.txt';

export function getDeviceApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
}

export function getStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function getDeviceIdFile() {
  return new File(Paths.document, DEVICE_ID_FILE_NAME);
}

export function readStoredDeviceId() {
  const deviceIdFile = getDeviceIdFile();
  if (!deviceIdFile.exists) {
    return null;
  }

  const storedDeviceId = deviceIdFile.textSync().trim();
  return storedDeviceId.length > 0 ? storedDeviceId : null;
}

export async function postDeliveryStatus(
  deviceId: string,
  notificationId: string,
  payload: { error?: string; status?: string },
) {
  const client = new DeviceClient({
    baseUrl: getDeviceApiBaseUrl(),
  });

  await client.postDeliveryStatus(deviceId, notificationId, payload);
}
