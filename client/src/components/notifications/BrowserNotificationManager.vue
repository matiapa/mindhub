<template>
  <div style="display: none;"></div>
  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
import { useNotificationsStore } from '@/stores/notifications';
import type { NotificationDto } from 'user-api-sdk';
import { NotificationDtoTypeEnum } from 'user-api-sdk';

export default {
  data: () => ({
    snackbar: {
      enabled: false,
      text: '',
    },
  }),

  computed: {
    notifications() {
      // console.log("Changes in notifications detected", this.notificationsStore.notifications)
      return this.notificationsStore.notifications;
    }
  },

  methods: {
    async requestNotificationPermission() {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // console.log('Notification permission granted.');
          return true;
        } else {
          console.warn('Notification permission denied.');
          this.snackbar.text = 'No se mostrarán notificaciones si no se concede el permiso';
          this.snackbar.enabled = true;
          return false;
        }
      } else {
        console.warn('Browser does not support notifications.');
        this.snackbar.text = 'No se mostrarán notificaciones dado que tu navegador no las soporta';
        this.snackbar.enabled = true;
        return false;
      }
    },

    buildNotification(type: NotificationDtoTypeEnum, payload: any) {
      switch (type) {
        case NotificationDtoTypeEnum.NewFriendshipRequest:
          return {
            title: `${payload.counterpartyName} te envió una solicitud de amistad`,
            message: "",
            url: `/#friends/${payload.counterpartyId}`
          };

        case NotificationDtoTypeEnum.AcceptedFriendshipProposal:
          return {
            title: `${payload.counterpartyName} aceptó tu solicitud de amistad`,
            message: "",
            url: `/#friends/${payload.counterpartyId}`
          };

        case NotificationDtoTypeEnum.RateFriendInvitation:
          return {
            title: `Recuerda calificar a ${payload.userName} para mejorar tus recomendaciones`,
            message: "",
            url: `/#friends/${payload.userId}/rate`
          };

        default:
          console.error("Unknown notification type:", type);
          throw new Error("Unknown notification type");
      }
    }
  },

  watch: {
    notifications(notifications: NotificationDto[]) {
      // console.log('Changes in notifications detected', notifications);

      notifications.forEach((notification) => {
        if (!notification.seen) {
          const { title, message, url } = this.buildNotification(notification.type, notification.payload);

          new Notification(title, {
            body: message,
            icon: "/img/logo.png",
            data: { url }
          });
        }
      });
    },
  },

  setup() {
    return {
      notificationsStore: useNotificationsStore()
    }
  },

  async created() {
    await this.requestNotificationPermission();
  },
};
</script>
