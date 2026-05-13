import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect, useState, useRef } from 'react';
import { fetchOrderChat, sendMessage, addLocalMessage } from '../../../store/slices/chatSlice';
import * as signalR from '@microsoft/signalr';
import { createChatHubConnection } from '../../../services/signalr';
import { Pressable } from 'react-native';

import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';

export default function ChatDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentChat, loading } = useSelector((state: RootState) => state.chat);
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [sending, setSending] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const flatListRef = useRef<FlatList>(null);

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
          await connection.invoke('JoinChat', id.toString());
          connectionRef.current = connection;
        } else {
          await connection.stop();
        }
      } catch (err) {
        console.error('Chat Hub Start Error: ', err);
      }
    };

    connection.on('ReceiveMessage', (message) => {
      dispatch(addLocalMessage(message));
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    startConnection();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected || connection.state === signalR.HubConnectionState.Connecting) {
        connection.stop().catch(e => {});
      }
    };
  }, [currentChat?.id, token, dispatch]);

  const handleSend = async (content?: string, attachments?: any[], audioFile?: any) => {
    if (!content?.trim() && !attachments?.length && !audioFile) return;
    setSending(true);
    try {
      await dispatch(sendMessage({ 
        chatId: currentChat.id, 
        content: content || '', 
        attachments,
        audioFile
      })).unwrap();
    } catch (err: any) {
      alert('فشل في إرسال الرسالة: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isSender = item.senderId === user?.id;
    return <MessageBubble message={item} isSender={isSender} />;
  };

  if (loading && !currentChat) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>المحادثة #{id?.toString().substring(0,8)}</Text>
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
            <Text style={{ color: Colors.textSecondary }}>لا توجد رسائل</Text>
          </View>
        }
      />

      <ChatInput onSend={handleSend} sending={sending} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.surface, shadowColor: 'rgba(30, 41, 59, 0.05)', shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 1, elevation: 4, zIndex: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  headerStatus: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  chatList: { padding: 16, paddingBottom: 16 },
});
