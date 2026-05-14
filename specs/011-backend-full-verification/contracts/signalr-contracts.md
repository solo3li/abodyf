# SignalR Contracts: backend-full-verification

## ChatHub (`/hubs/chat`)
### Server Methods (Client -> Hub)
- `JoinGroup(string chatId)`: Subscribes client to a chat group.
- `SendMessage(Guid chatId, string content)`: Broadcasts message to group.

### Client Methods (Hub -> Client)
- `ReceiveMessage(MessageDto message)`: Invoked when a new message arrives.

## PrivateChatHub (`/hubs/private-chat`)
### Server Methods (Client -> Hub)
- `JoinChat(Guid chatId)`: Subscribes client to a private chat group.

### Client Methods (Hub -> Client)
- `ReceiveMessage(MessageDto message)`: Invoked when a new message arrives.
- `ReceiveCustomOffer(object payload)`: Invoked when a new custom offer is sent.

## NotificationHub (`/hubs/notifications`)
### Client Methods (Hub -> Client)
- `ReceiveNotification(NotificationDto notification)`: Generic platform notification.
- `UpdateOrderCount(int count)`: Updates pending order counts for executors.
