import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '../../services/api';

// Feature 013 T009: Extended chat slice with voice state, uploadStatus, unreadCount

export type MessageType = 'Text' | 'Voice' | 'Image' | 'Video' | 'File';
export type UploadStatus = 'idle' | 'uploading' | 'failed' | 'sent';

export interface MessageAttachment {
  id: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  durationSeconds?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  waveformData?: number[];
  voiceDurationSeconds?: number;
  isDeleted: boolean;
  attachments: MessageAttachment[];
  sentAt: string;
  uploadStatus?: UploadStatus;
  localId?: string; // for optimistic updates
}

export interface InboxItem {
  chatId: string;
  type: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  lastMessagePreview: string;
  lastMessageType: MessageType;
  unreadCount: number;
  lastMessageAt?: string;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  isPreview: boolean;
  durationSeconds: number;
  waveformPeaks: number[];
  localAudioUri?: string;
}

// Async thunks
export const fetchOrderChat = createAsyncThunk(
  'chat/fetchOrderChat',
  async (orderId: string, { rejectWithValue }) => {
    try { return await apiFetch(`/Chat/Order/${orderId}`); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const fetchPrivateChat = createAsyncThunk(
  'chat/fetchPrivateChat',
  async (userId: string, { rejectWithValue }) => {
    try { return await apiFetch(`/Chat/Private/${userId}`); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const fetchInbox = createAsyncThunk(
  'chat/fetchInbox',
  async (_, { rejectWithValue }) => {
    try { return await apiFetch(`/Chat/Inbox`); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const markChatRead = createAsyncThunk(
  'chat/markChatRead',
  async (chatId: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/Chat/Inbox/${chatId}/Read`, { method: 'POST' });
      return chatId;
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

// Feature 013 T033: sendMessage with exponential back-off retry (3x: 1s/2s/4s)
async function apiFetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<any> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiFetch(url, options);
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw lastError;
}

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    {
      chatId,
      content,
      attachments,
      audioFile,
      waveformData,
      localId,
    }: {
      chatId: string;
      content?: string;
      attachments?: any[];
      audioFile?: any;
      waveformData?: number[];
      localId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (attachments) {
        attachments.forEach((file) => formData.append('attachments', file as any));
      }
      if (audioFile) {
        formData.append('audioFile', audioFile as any);
      }
      if (waveformData) {
        formData.append('waveformDataJson', JSON.stringify(waveformData));
      }

      const result = await apiFetchWithRetry(`/Chat/${chatId}/Message`, {
        method: 'POST',
        body: formData,
      });
      return { ...result, localId };
    } catch (err: any) {
      return rejectWithValue({ error: err.message, localId });
    }
  }
);

export const initiatePrivateChat = createAsyncThunk(
  'chat/initiatePrivateChat',
  async (executorId: string, { rejectWithValue }) => {
    try {
      return await apiFetch('/Chat/Private/Initiate', {
        method: 'POST',
        body: JSON.stringify({ executorId }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const sendCustomOffer = createAsyncThunk(
  'chat/sendCustomOffer',
  async (
    data: { chatId: string; title: string; description: string; price: number; deliveryDays: number },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch('/Chat/Offers', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const acceptCustomOffer = createAsyncThunk(
  'chat/acceptCustomOffer',
  async (offerId: string, { rejectWithValue }) => {
    try {
      return await apiFetch(`/Chat/Offers/${offerId}/Accept`, { method: 'POST' });
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

// State
interface ChatState {
  currentChat: any | null;
  inbox: InboxItem[];
  inboxSearch: string;
  loading: boolean;
  error: string | null;
  voice: VoiceRecordingState;
}

const initialVoice: VoiceRecordingState = {
  isRecording: false,
  isPaused: false,
  isPreview: false,
  durationSeconds: 0,
  waveformPeaks: [],
};

const initialState: ChatState = {
  currentChat: null,
  inbox: [],
  inboxSearch: '',
  loading: false,
  error: null,
  voice: initialVoice,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addLocalMessage(state, action: PayloadAction<ChatMessage>) {
      if (state.currentChat?.messages) {
        state.currentChat.messages.push(action.payload);
      }
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{ localId: string; status: UploadStatus; serverId?: string }>
    ) {
      if (state.currentChat?.messages) {
        const msg = state.currentChat.messages.find(
          (m: ChatMessage) => m.localId === action.payload.localId
        );
        if (msg) {
          msg.uploadStatus = action.payload.status;
          if (action.payload.serverId) msg.id = action.payload.serverId;
        }
      }
    },
    messageDeleted(state, action: PayloadAction<{ chatId: string; messageId: string }>) {
      if (state.currentChat?.messages) {
        const msg = state.currentChat.messages.find(
          (m: ChatMessage) => m.id === action.payload.messageId
        );
        if (msg) {
          msg.isDeleted = true;
          msg.content = '[تم حذف الرسالة]';
        }
      }
    },
    receiveMessage(state, action: PayloadAction<ChatMessage>) {
      if (state.currentChat?.messages) {
        const exists = state.currentChat.messages.find(
          (m: ChatMessage) => m.id === action.payload.id
        );
        if (!exists) state.currentChat.messages.push(action.payload);
      }
      // Update unread count in inbox
      const inboxItem = state.inbox.find(i => i.chatId === action.payload.chatId);
      if (inboxItem) {
        inboxItem.unreadCount += 1;
        inboxItem.lastMessagePreview =
          action.payload.type === 'Voice' ? '🎤 رسالة صوتية'
          : action.payload.type === 'Image' ? '📷 صورة'
          : action.payload.type === 'Video' ? '🎥 فيديو'
          : action.payload.type === 'File' ? '📎 ملف'
          : action.payload.content;
        inboxItem.lastMessageType = action.payload.type;
        inboxItem.lastMessageAt = action.payload.sentAt;
      }
    },
    setInboxSearch(state, action: PayloadAction<string>) {
      state.inboxSearch = action.payload;
    },
    // Voice recording state transitions
    startRecording(state) {
      state.voice = { ...initialVoice, isRecording: true };
    },
    pauseRecording(state) {
      state.voice.isRecording = false;
      state.voice.isPaused = true;
    },
    resumeRecording(state) {
      state.voice.isRecording = true;
      state.voice.isPaused = false;
    },
    addWaveformPeak(state, action: PayloadAction<number>) {
      state.voice.waveformPeaks.push(action.payload);
    },
    tickDuration(state) {
      state.voice.durationSeconds += 1;
    },
    finishRecording(state, action: PayloadAction<{ localAudioUri: string }>) {
      state.voice.isRecording = false;
      state.voice.isPaused = false;
      state.voice.isPreview = true;
      state.voice.localAudioUri = action.payload.localAudioUri;
    },
    discardRecording(state) {
      state.voice = initialVoice;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderChat.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderChat.fulfilled, (state, action) => {
        state.loading = false; state.currentChat = action.payload;
      })
      .addCase(fetchOrderChat.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })

      .addCase(fetchPrivateChat.pending, (state) => { state.loading = true; })
      .addCase(fetchPrivateChat.fulfilled, (state, action) => {
        state.loading = false; state.currentChat = action.payload;
      })
      .addCase(fetchPrivateChat.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })

      .addCase(initiatePrivateChat.pending, (state) => { state.loading = true; })
      .addCase(initiatePrivateChat.fulfilled, (state, action) => {
        state.loading = false; state.currentChat = action.payload;
      })
      .addCase(initiatePrivateChat.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })

      .addCase(fetchInbox.pending, (state) => { state.loading = true; })
      .addCase(fetchInbox.fulfilled, (state, action) => {
        state.loading = false; state.inbox = action.payload;
      })
      .addCase(fetchInbox.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })

      .addCase(markChatRead.fulfilled, (state, action) => {
        const item = state.inbox.find(i => i.chatId === action.payload);
        if (item) item.unreadCount = 0;
      })

      .addCase(sendMessage.pending, (state, action) => {
        const localId = (action.meta.arg as any).localId;
        if (localId && state.currentChat?.messages) {
          const msg = state.currentChat.messages.find((m: ChatMessage) => m.localId === localId);
          if (msg) msg.uploadStatus = 'uploading';
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const localId = action.payload.localId;
        if (localId && state.currentChat?.messages) {
          const idx = state.currentChat.messages.findIndex((m: ChatMessage) => m.localId === localId);
          if (idx >= 0) {
            state.currentChat.messages[idx] = { ...action.payload, uploadStatus: 'sent' };
          }
        }
        // reset voice state after send
        state.voice = initialVoice;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const localId = (action.payload as any)?.localId;
        if (localId && state.currentChat?.messages) {
          const msg = state.currentChat.messages.find((m: ChatMessage) => m.localId === localId);
          if (msg) msg.uploadStatus = 'failed';
        }
      });
  },
});

export const {
  addLocalMessage, updateMessageStatus, messageDeleted, receiveMessage,
  setInboxSearch, startRecording, pauseRecording, resumeRecording,
  addWaveformPeak, tickDuration, finishRecording, discardRecording,
} = chatSlice.actions;

// Selectors
export const selectFilteredInbox = (state: { chat: ChatState }) => {
  const search = state.chat.inboxSearch.toLowerCase();
  if (!search) return state.chat.inbox;
  return state.chat.inbox.filter(
    i => i.contactName.toLowerCase().includes(search) ||
         i.lastMessagePreview.toLowerCase().includes(search)
  );
};

export default chatSlice.reducer;