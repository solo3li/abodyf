# SignalR Hub Contract: PrivateChatHub

## Server-to-Client (Methods users must listen for)

### ReceiveMessage
Triggered when any message (text, media, offer) is sent.
- **Payload**: `MessageDto`

### ReceiveCustomOffer
Specific event for offer updates (new, withdrawn, rejected).
- **Payload**: `OfferUpdateDto`

### UserTyping
Broadcasts that a user is currently typing.
- **Payload**: `userId: string`

### UserRecording
Broadcasts that a user is currently recording a voice message.
- **Payload**: `userId: string`

## Client-to-Server (Methods users can call)

### JoinChat
Adds the connection to a specific chat group.
- **Arguments**: `chatId: string`

### LeaveChat
Removes the connection from a specific chat group.
- **Arguments**: `chatId: string`

### SignalTyping
Notifies the other party that the user is typing.
- **Arguments**: `chatId: string`

### SignalRecording
Notifies the other party that the user is recording.
- **Arguments**: `chatId: string`
