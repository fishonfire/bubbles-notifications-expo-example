import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { DeviceClient } from 'bubbles-npm-user-app';
import { File, Paths } from 'expo-file-system';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
const DEVICE_ID_FILE_NAME = 'device-id.txt';

function getStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function getDeviceApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
}

function getDeviceIdFile() {
  return new File(Paths.document, DEVICE_ID_FILE_NAME);
}

function readStoredDeviceId() {
  const deviceIdFile = getDeviceIdFile();
  if (!deviceIdFile.exists) {
    return null;
  }

  const storedDeviceId = deviceIdFile.textSync().trim();
  return storedDeviceId.length > 0 ? storedDeviceId : null;
}

async function postDeliveryStatus(
  deviceId: string,
  notificationId: string,
  payload: { error?: string; status?: string },
) {
  const client = new DeviceClient({
    baseUrl: getDeviceApiBaseUrl(),
  });

  await client.postDeliveryStatus(deviceId, notificationId, payload);
}

if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error, executionInfo }) => {
      if (error) {
        console.error('Background notification task failed', error);
        return Notifications.BackgroundNotificationTaskResult.Failed;
      }

      // This function could also be triggered by tapping a notification
      // This check prevents us frm sending a new notification in that case
      if ('actionIdentifier' in data) {
        return Notifications.BackgroundNotificationTaskResult.NoData;
      }

      const notificationData = data.data as Record<string, unknown>;
      const deviceId = readStoredDeviceId();
      const notificationId =
        getStringValue(notificationData.notification_id) ??
        getStringValue(notificationData.id);

      const currentSettings = await Notifications.getPermissionsAsync();
      if (!currentSettings.granted) {
        if (deviceId && notificationId) {
          await postDeliveryStatus(deviceId, notificationId, {
            status: 'notifications disabled',
          });
        }

        return;
      }

      if (deviceId && notificationId) {
        await postDeliveryStatus(deviceId, notificationId, {
          status: 'notification received',
        });
      }

      const title = getStringValue(notificationData.message_title) ?? 'Background notification received';
      const body = getStringValue(notificationData.body) ?? 'Open the app to view this update.';

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: notificationData,
          },
          trigger: null,
        });

        if (deviceId && notificationId) {
          await postDeliveryStatus(deviceId, notificationId, {
            status: 'notification shown',
          });
        }
      } catch (scheduleError) {
        if (deviceId && notificationId) {
          await postDeliveryStatus(deviceId, notificationId, {
            error:
              scheduleError instanceof Error
                ? `Failed to show notification: ${scheduleError.message}`
                : 'Failed to show notification',
          });
        }

        throw scheduleError;
      }

      return Notifications.BackgroundNotificationTaskResult.NewData;
    },
  );
}

void Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch((error) => {
  console.error('Failed to register background notification task', error);
});
