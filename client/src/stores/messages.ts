import { defineStore } from 'pinia';
import { MessagesApiFactory } from 'user-api-sdk';
import type Message from '@/types/message.interface';

let messagesApi: ReturnType<typeof MessagesApiFactory>;

export const useMessageStore = defineStore('messageStore', {
  state: () => ({
    newMessages: [] as Message[],
  }),

  actions: {
    setup(useWebpush: boolean) {
      const idToken = localStorage.getItem('id_token');
      if (!idToken) {
        return;
      }

      messagesApi = MessagesApiFactory({
          basePath: import.meta.env.VITE_API_URL,
          accessToken: () => idToken,
          isJsonMime: () => true,
      });

      if (useWebpush) {
        this.subscribeToWebPushMessages();
      } else {
        this.startPollingNewMessages();
      }
    },

    subscribeToWebPushMessages() {
      console.log("Using webpush for new messages store");

      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        const { eventType, eventPayload } = event.data;

        // console.log('Message from service worker:', { eventType, eventPayload });

        if (eventType !== 'new_chat_message')
          return;

        const newMessage = eventPayload as Message;

        // We cant use push because it will not trigger the reactivity
        this.newMessages = [...this.newMessages, newMessage];

        console.log("Pushed new message", newMessage)
      });
    },

    startPollingNewMessages() {
      console.log("Using polling for new messages store");

      this.fetchNewMessages();
      
      setInterval(
        () => { this.fetchNewMessages(); },
        import.meta.env.VITE_MESSAGE_POLLING_INTERVAL
      );
    },

    async fetchNewMessages() {
      try {
        const response = await messagesApi.messagesControllerGetMessages(undefined, "true");
        this.newMessages = response.data.messages;
        // console.log("New messages", this.newMessages)
      } catch (error) {
        console.error('Error fetching new messages:', error);
      }
    },

    async markMessagesAsRead(messageIds: string[]) {
      try {
        // console.log("Marking messages as read", messageIds)
        this.newMessages = this.newMessages.filter(m => !messageIds.includes(m._id));

        await messagesApi.messagesControllerMarkMessagesSeen({ messageIds });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },
  },
});
