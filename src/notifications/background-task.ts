import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

function getStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error, executionInfo }) => {
      if (error) {
        console.error('Background notification task failed', error);
        return Notifications.BackgroundNotificationTaskResult.Failed;
      }

      console.log('Background notification received', {
        data,
        executionInfo,
      });

      // This function could also be triggered by tapping a notification
      // This check prevents us frm sending a new notification in that case
      if ('actionIdentifier' in data) {
        return Notifications.BackgroundNotificationTaskResult.NoData;
      }

      const notificationData = data.data;
      const title = getStringValue(notificationData.title) ?? 'Background notification received';
      const body = getStringValue(notificationData.body) ?? 'Open the app to view this update.';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: notificationData,
        },
        trigger: null,
      });

      console.log('We done did it?')

      return Notifications.BackgroundNotificationTaskResult.NewData;
    },
  );
}

void Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch((error) => {
  console.error('Failed to register background notification task', error);
});
