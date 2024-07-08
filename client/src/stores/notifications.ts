import { defineStore } from 'pinia';
import { NotificationsApiFactory } from 'user-api-sdk';
import type { NotificationDto } from 'user-api-sdk';

let notificationsApi: ReturnType<typeof NotificationsApiFactory>;

export const useNotificationsStore = defineStore('notificationsStore', {
  state: () => ({
    notifications: [] as NotificationDto[],
  }),

  actions: {
    setup(useWebpush: boolean) {
      const idToken = localStorage.getItem('id_token');
      if (!idToken) {
        return;
      }

      notificationsApi = NotificationsApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
      });

      this.fetchNotifications();

      if (useWebpush) {
        this.subscribeToWebPushMessages();
      } else {
        this.startPollingNotifications();
      }
    },

    subscribeToWebPushMessages() {
      console.log("Using webpush for notifications store");

      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        const { eventType, eventPayload } = event.data;

        // console.log('Message from service worker:', { eventType, eventPayload });

        if (eventType !== 'new_app_notification')
          return;

        const notification = eventPayload as NotificationDto;

        // We cant use push because it will not trigger the reactivity
        this.notifications = [...this.notifications, notification];

        // console.log("Pushed new notification", notification)
      });
    },

    startPollingNotifications() {
      console.log("Using polling for notifications store");
      
      setInterval(
        () => { this.fetchNotifications(); },
        import.meta.env.VITE_NOTIFICATION_POLLING_INTERVAL
      );
    },

    async fetchNotifications() {
      try {
        const response = await notificationsApi.notificationsControllerGetAppNotifications();
        // console.log("Fetched notifications:", response.data.notifications)
        
        this.notifications = response.data.notifications;
      } catch (error) {
        console.error('Error fetching new notifications:', error);
      }
    },

    async markNotificationsAsRead(notificationsIds: string[]) {
      try {
        // console.log("Marking notifications as read", notificationsIds)
        this.notifications = this.notifications.map((n) => ({...n, seen: true || notificationsIds.includes(n._id)}));

        await notificationsApi.notificationsControllerMarkSeen({ ids: notificationsIds });
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    },
  },
});
