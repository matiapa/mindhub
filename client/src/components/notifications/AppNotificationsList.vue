<template>
  <v-list>
    <div v-if="notifications.length">
      <v-list-item v-for="notification in notifications" :key="notification._id" 
          @click="openRoute(notification.route)" density="compact">
        <template v-slot:prepend>
          <v-icon icon="mdi-circle-medium" color="error" v-if="!notification.seen"></v-icon>
        </template>
        <v-list-item-title>{{ notification.title }}</v-list-item-title>
        <v-list-item-subtitle>{{ notification.subtitle }}</v-list-item-subtitle>
      </v-list-item>
    </div>
    <div v-else>
      <v-list-item>
        <v-list-item-title>No tienes notificaciones</v-list-item-title>
      </v-list-item>
    </div>
  </v-list>
</template>

<script lang="ts">
import type { NotificationDto } from 'user-api-sdk';
import { NotificationDtoTypeEnum } from 'user-api-sdk';
import { useNotificationsStore } from '@/stores/notifications';

interface Notification {
  _id: string;
  title: string;
  subtitle: string;
  route: string;
  seen: boolean;
}

export default {
  data: () => ({
    loading: false,
  }),

  computed: {
    notifications(): Notification[] {
      // console.log("Changes in notifications detected", this.notificationsStore.notifications)
      return this.notificationsStore.notifications.map(this.buildNotification);
    },
  },

  methods: {
    buildNotification(dto: NotificationDto): Notification {
      const payload = dto.payload as any;
      switch (dto.type) {
        case NotificationDtoTypeEnum.NewFriendshipRequest:
          return {
            _id: dto._id,
            title: `${payload.counterpartyName} te envió una solicitud de amistad`,
            subtitle: "",
            route: `/#friends/${payload.counterpartyId}/profile`,
            seen: dto.seen,
          };

        case NotificationDtoTypeEnum.AcceptedFriendshipProposal:
          return {
            _id: dto._id,
            title: `${payload.counterpartyName} aceptó tu solicitud de amistad`,
            subtitle: "",
            route: `/#friends/${payload.counterpartyId}/profile`,
            seen: dto.seen,
          };

        case NotificationDtoTypeEnum.RateFriendInvitation:
          return {
            _id: dto._id,
            title: `Recuerda calificar a ${payload.userName} para mejorar tus recomendaciones`,
            subtitle: "",
            route: `/#friends/${payload.userId}/rate`,
            seen: dto.seen,
          };

        default:
          console.error("Unknown notification type:", dto.type);
          throw new Error("Unknown notification type");
      }
    },

    openRoute(route: string) {
      const urlToOpen = new URL(route, window.location.origin).href;

      // console.log("Opening route:", urlToOpen);

      window.location.href = urlToOpen;
    },

    async markAsRead() {
      // console.log("Marking notifications as read")
      const unreadIds = this.notifications.filter(n => !n.seen).map(n => n._id);
      if (unreadIds.length) {
        await this.notificationsStore.markNotificationsAsRead(unreadIds);
      }
    }
  },

  setup() {
    return {
      notificationsStore: useNotificationsStore()
    }
  },

  async unmounted() {
    this.markAsRead();
  },
};
</script>
