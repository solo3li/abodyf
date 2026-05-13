# Data Model: Rich Chat Media, Admin Service Approval & Advanced Search

**Feature**: 013-rich-chat-media-admin-search
**Date**: 2026-05-13

---

## Existing Models (Extended)

### `Message` — Extended

```csharp
public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = null!;
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    // NEW: message type for FE rendering routing
    public MessageType Type { get; set; } = MessageType.Text;

    // EXISTING: waveform amplitude samples (int[] normalized 0–100)
    public int[]? WaveformData { get; set; }

    // NEW: duration in seconds for voice messages
    public int? VoiceDurationSeconds { get; set; }

    // NEW: soft-delete support for admin moderation
    public bool IsDeleted { get; set; } = false;
    public Guid? DeletedByAdminId { get; set; }
    public DateTime? DeletedAt { get; set; }

    public ICollection<MessageAttachment> Attachments { get; set; } = new List<MessageAttachment>();
    public Guid? CustomOfferId { get; set; }
    public CustomOffer? CustomOffer { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

public enum MessageType
{
    Text,
    Voice,
    Image,
    Video,
    File
}
```

### `MessageAttachment` — Extended

```csharp
public class MessageAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MessageId { get; set; }
    public Message Message { get; set; } = null!;
    public string Url { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty; // NEW: for image/video previews
    public string FileName { get; set; } = string.Empty;
    // EXTENDED: added "Video" to allowed values
    public string FileType { get; set; } = string.Empty; // Image, Video, Document, Audio
    public long FileSize { get; set; }
    public int? DurationSeconds { get; set; } // NEW: for Audio/Video
}
```

### `Service` — Extended

```csharp
// Existing Status values: Draft, PendingApproval, Active, Paused, Rejected
// CHANGE: Default status for executor-submitted services → "PendingApproval" (was "Draft")
// NEW: track when service was last edited to trigger re-approval
public DateTime? LastEditedAt { get; set; }
public Guid? LastEditedByExecutorId { get; set; }
```

### `SubCategory` — NEW

```csharp
public class SubCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
```

Relationship: `Category` 1 → N `SubCategory`; `Service` gains `SubCategoryId Guid?` FK.

### `TicketMessage` — Extended

```csharp
// Existing model — add rich media support to mirror Message:
public MessageType Type { get; set; } = MessageType.Text;
public int[]? WaveformData { get; set; }
public int? VoiceDurationSeconds { get; set; }
// Attachments already supported via existing ICollection<MessageAttachment>
```

---

## New Models

### `ModerationAction` — NEW

```csharp
public class ModerationAction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AdminId { get; set; }
    public User Admin { get; set; } = null!;

    public ModerationActionType ActionType { get; set; }

    // Polymorphic target: either a Message or a User
    public Guid? TargetMessageId { get; set; }
    public Message? TargetMessage { get; set; }

    public Guid? TargetUserId { get; set; }
    public User? TargetUser { get; set; }

    // For mutes: duration in minutes; null = indefinite
    public int? DurationMinutes { get; set; }
    public DateTime? MuteExpiresAt { get; set; } // computed: CreatedAt + DurationMinutes

    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ModerationActionType
{
    MessageFlagged,
    MessageDeleted,
    UserMuted
}
```

### `ChatReadReceipt` — NEW

```csharp
public class ChatReadReceipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime LastReadAt { get; set; } = DateTime.UtcNow;
}
// Unique constraint: (ChatId, UserId)
```

Used to compute `unreadCount` per conversation in inbox response.

---

## Frontend State (Redux / TypeScript)

### `chatSlice` — Extended State Shape

```typescript
interface VoiceRecordingState {
  status: 'idle' | 'recording' | 'paused' | 'preview' | 'sending';
  uri: string | null;
  durationSeconds: number;
  peaks: number[];          // amplitude samples, 0–100
  currentPlaybackProgress: number; // 0–1 for preview playback
}

interface MessageState {
  id: string;
  chatId: string;
  senderId: string;
  type: 'text' | 'voice' | 'image' | 'video' | 'file';
  content: string;
  waveformData?: number[];
  voiceDurationSeconds?: number;
  attachments: AttachmentState[];
  uploadStatus: 'delivered' | 'uploading' | 'failed'; // FE-only
  isDeleted: boolean;
  sentAt: string;
}

interface AttachmentState {
  id: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileType: 'image' | 'video' | 'file' | 'audio';
  fileSize: number;
  durationSeconds?: number;
}

interface InboxItemState {
  chatId: string;
  contactName: string;
  contactAvatar: string | null;
  lastMessagePreview: string;       // text content or media-type label
  lastMessageType: 'text' | 'voice' | 'image' | 'video' | 'file';
  unreadCount: number;
  lastMessageAt: string;
}
```

### New `searchSlice` State

```typescript
interface SearchFilter {
  keyword: string;
  categoryId: string | null;
  subCategoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  availability: 'any' | 'available_now' | 'scheduled' | null;
  deliveryDays: number | null;
  sortBy: 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'newest';
  page: number;
}
```

---

## State Transitions

### `VoiceRecording` (FE-only)
```
idle → recording (start button pressed)
recording → paused (OS interruption / call)
paused → recording (user taps Resume)
paused → idle (user taps Discard)
recording → preview (stop button pressed)
preview → idle (user taps Discard)
preview → sending (user taps Send)
sending → idle (upload success)
```

### `Service.Status` (Backend)
```
[Executor submits] → PendingApproval
PendingApproval → Active (Admin approves)
PendingApproval → Rejected (Admin rejects)
Active → PendingApproval (Executor edits core fields → re-approval required)
Active → Paused (Executor pauses listing)
Paused → PendingApproval (Executor re-activates after edits)
Rejected → PendingApproval (Executor resubmits after fixing issues)
```

### `Message.IsDeleted` (Admin Moderation)
```
IsDeleted = false → IsDeleted = true (Admin deletes)
// Irreversible. Content replaced with "[تم حذف الرسالة]" placeholder displayed to users.
```

---

## Database Migrations Required

| # | Migration Name | Description |
|---|---|---|
| M-001 | `AddMessageTypeAndSoftDelete` | Add `Type`, `VoiceDurationSeconds`, `IsDeleted`, `DeletedByAdminId`, `DeletedAt` to `Messages` |
| M-002 | `AddAttachmentThumbnailAndDuration` | Add `ThumbnailUrl`, `DurationSeconds` to `MessageAttachments` |
| M-003 | `AddSubCategory` | New `SubCategories` table; add `SubCategoryId` FK to `Services` |
| M-004 | `AddModerationAction` | New `ModerationActions` table |
| M-005 | `AddChatReadReceipt` | New `ChatReadReceipts` table with unique constraint |
| M-006 | `AddServiceLastEditedAt` | Add `LastEditedAt`, `LastEditedByExecutorId` to `Services` |
| M-007 | `AddTicketMessageRichMedia` | Add `Type`, `WaveformData`, `VoiceDurationSeconds` to `TicketMessages` |
| M-008 | `SetServiceDefaultStatusPendingApproval` | Data migration: update controller default; no schema change |
