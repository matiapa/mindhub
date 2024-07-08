function buildNotification(type, payload) {
  switch (type) {
    case "new_chat_message":
      return {
        title: `Mensaje de ${payload.senderName}`,
        message: payload.text,
        url: `/#friends/${payload.sender}/chat`
      };

    case "new_friendship_request":
      return {
        title: `${payload.counterpartyName} te envió una solicitud de amistad`,
        message: "",
        url: `/#friends/${payload.counterpartyId}/profile`
      };

    case "accepted_friendship_proposal":
      return {
        title: `${payload.counterpartyName} aceptó tu solicitud de amistad`,
        message: "",
        url: `/#friends/${payload.counterpartyId}/profile`
      };

    case "rate_friend_invitation":
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

self.addEventListener('install', () => {
  self.skipWaiting();
});


self.addEventListener("push", (event) => {
  // console.log("Received push event", event.data.json())

  const { eventType, eventPayload } = event.data.json();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // ------------------ Display browser notification ------------------

      // We will only display browser notifications from here if the client is not active
      // otherwise, is up to the client to decide wether displaying o not a browser notification

      let isClientVisible = false;
      clientList.forEach(client => {
        if (client.visibilityState === 'visible') {
          isClientVisible = true;
        }
      });

      if (!isClientVisible) {
        // console.log("Client is inactive, displaying notification from service worker")

        let browserNotification;

        if (eventType == "new_app_notification") {
          // console.log("Received a new notification");
          const notification = eventPayload;

          browserNotification = buildNotification(notification.type, notification.payload);
        } else if (eventType == "new_chat_message") {
          // console.log("Received a new chat message");
          const message = eventPayload;

          browserNotification = buildNotification("new_chat_message", message);
        } else {
          console.error("Invalid event type", eventType);
        }

        if (browserNotification) {
          const { title, message, url } = browserNotification;
          event.waitUntil(
            self.registration.showNotification(title, {
              title: title,
              body: message,
              icon: "/img/logo.png",
              data: { url }
            })
          );
          // console.log("Displayed browser notification", { title, message, url })
        }
      }

      // ------------------ Send the message to the client ------------------

      clientList.forEach(client => {
        client.postMessage({ eventType, eventPayload });
        // console.log("Sent push event to client")
      });
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
