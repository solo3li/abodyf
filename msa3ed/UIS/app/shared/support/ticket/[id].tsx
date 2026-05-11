import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { fetchTicketById, replyToTicket, addLocalTicketMessage } from '../../../../store/slices/ticketsSlice';
import * as signalR from '@microsoft/signalr';
import { createChatHubConnection } from '../../../../services/signalr';
import { Pressable } from 'react-native';

import ChatInput from '../../chat/components/ChatInput';
import MessageBubble from '../../chat/components/MessageBubble';

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTicket: ticket, loading } = useSelector((state: RootState) => state.tickets);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [sending, setSending] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchTicketById(id as string));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!id || !token) return;

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
        console.error('Ticket Hub Start Error: ', err);
      }
    };

    connection.on('ReceiveMessage', (message) => {
      dispatch(addLocalTicketMessage(message));
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    startConnection();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected || connection.state === signalR.HubConnectionState.Connecting) {
        connection.stop().catch(e => {});
      }
    };
  }, [id, token, dispatch]);

  const handleSend = async (content?: string, attachment?: any, type: string = 'file') => {
    if (!content?.trim() && !attachment) return;
    setSending(true);
    try {
      await dispatch(replyToTicket({ 
        id: id as string, 
        content: content || '', 
        attachment, 
        attachmentType: type 
      })).unwrap();
    } catch (err: any) {
      alert('فشل في إرسال الرد: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isSender = item.senderId === user?.id;
    const normalizedMessage = {
        ...item,
        sentAt: item.sentAt || item.createdAt,
        attachmentType: item.attachmentType === 'voice' ? 'audio' : item.attachmentType
    };
    return <MessageBubble message={normalizedMessage} isSender={isSender} />;
  };

  if (loading || !ticket) {
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>#{ticket.id.toString().substring(0,8)}</Text>
          <Text style={styles.headerStatus}>{ticket.status === 'Open' ? 'نشطة' : 'مغلقة'}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.subjectBox}>
        <Text style={styles.subjectTitle}>{ticket.subject}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={ticket.messages || []}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 20 }}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.white, boxShadow: [{ color: 'rgba(0, 0, 0, 0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }], elevation: 2, zIndex: 10 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  headerStatus: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  subjectBox: { backgroundColor: Colors.primary + '10', padding: 16, marginHorizontal: 24, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary + '30' },
  subjectTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  chatList: { padding: 24 },
});
