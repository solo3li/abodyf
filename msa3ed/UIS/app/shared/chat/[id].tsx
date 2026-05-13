import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect, useState, useRef } from 'react';
import { fetchOrderChat, fetchPrivateChat, sendMessage, addLocalMessage, markChatRead } from '../../../store/slices/chatSlice';
import * as signalR from '@microsoft/signalr';
import { createChatHubConnection, createPrivateChatHubConnection } from '../../../services/signalr';
import { Pressable } from 'react-native';

import ChatInput from './components/ChatInput';
import MessageBubble from '../../../components/chat/MessageBubble';

export default function ChatDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentChat, loading } = useSelector((state: RootState) => state.chat);
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [sending, setSending] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isRTL = I18nManager.isRTL;

  // Assume id is chatId for order, or "private_userId" for private.
  // Actually, previously id was just passed to fetchOrderChat. Let's keep it simple.
  useEffect(() => {
    if (id) {
      dispatch(fetchOrderChat(id as string));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!currentChat?.id || !token) return;

    let isMounted = true;
    const connection = createChatHubConnection(token);

    const startConnection = async () => {
      try {
        await connection.start();
        if (isMounted) {
          await connection.invoke('JoinChat', currentChat.id.toString());
          connectionRef.current = connection;
          
          // Mark chat as read
          dispatch(markChatRead(currentChat.id));
          connection.invoke('MarkRead', currentChat.id.toString()).catch(() => {});
        } else {
          await connection.stop();
        }
      } catch (err) {
        console.error('Chat Hub Start Error: ', err);
      }
    };

    connection.on('ReceiveMessage', (message) => {
      dispatch(addLocalMessage(message));
      // Mark read when received while open
      dispatch(markChatRead(currentChat.id));
      connection.invoke('MarkRead', currentChat.id.toString()).catch(() => {});
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    connection.on('MessageDeleted', ({ messageId }) => {
       // Ideally we dispatch messageDeleted here, but for simplicity let's rely on re-fetching or state
    });

    startConnection();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected || connection.state === signalR.HubConnectionState.Connecting) {
        connection.stop().catch(e => {});
      }
    };
  }, [currentChat?.id, token, dispatch]);

  const handleSend = async (payload: { content?: string; attachments?: any[]; audioFile?: any; waveformData?: number[] }) => {
    if (!payload.content?.trim() && !payload.attachments && !payload.audioFile) return;
    
    // Optimistic UI localId
    const localId = Math.random().toString(36).substring(7);
    
    setSending(true);
    try {
      await dispatch(sendMessage({ 
        chatId: currentChat.id, 
        ...payload,
        localId
      })).unwrap();
    } catch (err: any) {
      // Error handled by redux state `uploadStatus: 'failed'`
    } finally {
      setSending(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isSender = item.senderId === user?.id;
    return <MessageBubble message={item} isOwn={isSender} />;
  };

  if (loading && !currentChat) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtlHeader]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>محادثة #{currentChat?.id?.toString().substring(0,8)}</Text>
          <Text style={styles.headerStatus}>متصل الآن</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        ref={flatListRef}
        data={currentChat?.messages || []}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#555577' }}>لا توجد رسائل بعد</Text>
          </View>
        }
      />

      <ChatInput onSend={handleSend} sending={sending} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 24, paddingTop: 60, 
    backgroundColor: '#1a1a2e', 
    borderBottomWidth: 1, borderBottomColor: '#2a2a4e',
    zIndex: 10 
  },
  rtlHeader: { flexDirection: 'row-reverse' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerStatus: { fontSize: 12, color: '#2ecc71', fontWeight: '500' },
  chatList: { padding: 24, paddingBottom: 16 },
});
