// src/components/CheckUpdates.vue

<template>
  <div style="display: none;"></div>
  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
import { NotificationsApiFactory, NotificationDtoTypeEnum } from 'user-api-sdk';
import type { NotificationDto } from 'user-api-sdk';

let notificationsApi: ReturnType<typeof NotificationsApiFactory>;

export default {
  data: () => ({
    snackbar: {
      enabled: false,
      text: '',
    },
  }),

  methods: {
    async requestNotificationPermission() {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          return true;
        } else {
          console.log('Notification permission denied.');
          this.snackbar.text = 'No se mostrarán notificaciones si no se concede el permiso';
          this.snackbar.enabled = true;
          return false;
        }
      } else {
        console.log('Browser does not support notifications.');
        this.snackbar.text = 'No se mostrarán notificaciones dado que tu navegador no las soporta';
        this.snackbar.enabled = true;
        return false;
      }
    },

    async checkForNotifications() {
      try {
        // console.log('Checking for notifications')

        const notifications = await notificationsApi.notificationsControllerGetNotifications();

        // console.log('Notifications:', notifications.data.notifications);

        notifications.data.notifications.forEach(notification => {
          const { title, message } = this.buildNotification(notification);
          this.showNotification(title, message);
        });

        if (notifications.data.notifications.length > 0) {
          notificationsApi.notificationsControllerMarkSeen({ ids: notifications.data.notifications.map(n => n._id) });
        }
      } catch (error) {
        console.error('Error checking for notifications:', error);
      }
    },

    buildNotification(notification: NotificationDto) {
      const payload = notification.payload as any;

      switch(notification.type) {
        case NotificationDtoTypeEnum.NewMessage:
          return {
            title: `Mensaje de ${payload.senderName}`,
            message: payload.message
          };

        case NotificationDtoTypeEnum.NewFriendshipRequest:
          return {
            title: `${payload.counterpartyName} te envió una solicitud de amistad`,
            message: ""
          };

        case NotificationDtoTypeEnum.AcceptedFriendshipProposal:
          return {
            title: `${payload.counterpartyName} aceptó tu solicitud de amistad`,
            message: ""
          };

        default:
          console.error('Unknown notification type:', notification.type);
          throw new Error('Unknown notification type');
      }
    },

    showNotification(title: string, message: string) {
      new Notification(title, {
        body: message,
        // icon: 'logo-dark.png',
      });
    },
  },

  async created() {
    const idToken = localStorage.getItem('id_token')!;

    notificationsApi = NotificationsApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    });

    const notificationsEnabled = await this.requestNotificationPermission();
    if (notificationsEnabled) {
      setInterval(this.checkForNotifications, import.meta.env.VITE_NOTIFICATION_POLLING_INTERVAL);
    }
  },
};
</script>
