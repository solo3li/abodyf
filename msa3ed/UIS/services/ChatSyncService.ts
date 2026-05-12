import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedMessage {
  chatId: string;
  content?: string;
  attachments?: any[];
  audioFile?: any;
}

const QUEUE_KEY = '@chat_message_queue';

export const queueMessage = async (message: QueuedMessage) => {
  const currentQueue = await getQueue();
  currentQueue.push(message);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
};

export const getQueue = async (): Promise<QueuedMessage[]> => {
  const data = await AsyncStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};

// Placeholder for auto-retry logic
export const processQueue = async (sender: (msg: QueuedMessage) => Promise<void>) => {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const msg of queue) {
    try {
      await sender(msg);
    } catch (e) {
      remaining.push(msg);
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
};
