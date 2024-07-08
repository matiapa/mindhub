<template>
    <v-card>
        <v-card-title>
            {{  user.user.profile.name }}
        </v-card-title>
        <v-card-text>
          <div class="chat-container" v-if="!loading && messages.length">
            <div class="messages" ref="messages">
              <div v-for="(message, index) in messages" :key="index" :class="['message', isOwn(message) ? 'own' : 'counterparty']">
                {{ message.text }}
              </div>
            </div>
          </div>
          <div v-if="!loading && !messages.length" class="suggestion-container">
            <v-card class="suggestion">
              <v-card-title>
                Sugerencia
              </v-card-title>
              <v-card-text>
                {{ suggestion }}
              </v-card-text>
            </v-card>
          </div>
          <div class="loading-container" v-if="loading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
        </v-card-text>
        <v-card-actions>
            <v-text-field v-model="newMessage" label="Escribe un mensaje" append-icon="mdi-send"
                @click:append="sendMessage" @keyup.enter="sendMessage"
            ></v-text-field>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import { InterestsApiFactory, MessagesApiFactory } from 'user-api-sdk';
import type { PropType } from 'vue';
import type User from '@/types/user.interface';
import type Message from '@/types/message.interface';
import { useMessageStore } from '@/stores/messages';

let messagesApi: ReturnType<typeof MessagesApiFactory>;
let interestsApi: ReturnType<typeof InterestsApiFactory>;
const ownUserId = localStorage.getItem('uuid')!;

let messageStore = useMessageStore();

export default {
  props: {
    user: {
        type: Object as PropType<User>,
        required: true
    },
    prefilledMessage: String,
  },

  data() {
    return {
      loading: false,
      messages: [] as Message[],
      newMessage: '',
      suggestion: '',
      interval: null as any,
    };
  },

  computed: {
    newMessages() {
      return messageStore.newMessages;
    }
  },

  methods: {
    async getAllMessages() {
      try {
        this.loading = true;

        const response = await messagesApi.messagesControllerGetMessages(this.user.user._id);
        this.messages = response.data.messages;
        this.scrollToEnd();

        await this.generateSuggestion();

        const unreadIds = this.messages.filter(m => m.receiver==ownUserId && !m.seen).map(m => m._id);
        if (unreadIds.length) {
          await messageStore.markMessagesAsRead(unreadIds);
        }

        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },

    async generateSuggestion() {
      if (this.messages.length > 0) return;

      let sharedInterests = this.user.user.sharedInterests;
      if (!sharedInterests) {
        const res = await interestsApi.interestsControllerGetShared(this.user.user._id);
        sharedInterests = res.data.sharedInterests;
      }

      if (sharedInterests.length > 0) {
        const randomInterest = sharedInterests[Math.floor(Math.random() * sharedInterests.length)];
        this.suggestion = `A ambos les interesa "${randomInterest.resource.name}"`;
      }
    },

    async sendMessage() {
      const text = this.newMessage.trim();
      if (text === '')
        return;

      this.messages.push({
        _id: "", text, sender: ownUserId, receiver: this.user.user._id,seen: true, createdAt: new Date().toDateString()
      });
      this.newMessage = '';
      this.scrollToEnd();

      try {
        await messagesApi.messagesControllerPostMessage({ receiverId: this.user.user._id, text });
      } catch (e) {
        console.error(e);
        
        this.messages.pop();
        this.newMessage = text;
      }
    },

    isOwn(message: any) {
      return message.sender == ownUserId;
    },

    scrollToEnd() {
      this.$nextTick(() => {
        const container = this.$refs.messages as any;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
  },

  watch: {
    newMessages(newMessages: Message[]) {
      // console.log("Changes in new messages detected", newMessages)

      const pertinentMessages = newMessages.filter(m => m.sender == this.user.user._id)
      // console.log("Pertinent messages", pertinentMessages)

      if (pertinentMessages.length) {
        this.messages.push(...pertinentMessages);
        this.scrollToEnd();
        messageStore.markMessagesAsRead(pertinentMessages.map(m => m._id));
      }
    }
  },

  created() {
      const idToken = localStorage.getItem('id_token')!;

      messagesApi = MessagesApiFactory({
          basePath: import.meta.env.VITE_API_URL,
          accessToken: () => idToken,
          isJsonMime: () => true,
      });

      interestsApi = InterestsApiFactory({
          basePath: import.meta.env.VITE_API_URL,
          accessToken: () => idToken,
          isJsonMime: () => true,
      })

      this.newMessage = this.prefilledMessage ?? '';

      this.getAllMessages();
  },
};
</script>

<style>
.chat-container {
    height: 400px;
    overflow-y: auto;
}

.messages {
    display: flex;
    flex-direction: column;
}

.message {
    max-width: 70%;
    padding: 8px;
    margin: 4px 0;
    border-radius: 4px;
}

.own {
    align-self: flex-end;
    color: #ffffff;
    background-color: #757575;
}

.counterparty {
    align-self: flex-start;
    color: #ffffff;
    background-color: #607d8b;
}

.suggestion-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.suggestion {
  background-color: #37474f;
  color: white;
  width: 30%;
}
</style>
