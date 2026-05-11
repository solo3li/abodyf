import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { useEffect, useState, useRef } from 'react';
import { fetchPrivateChat, sendMessage, addLocalMessage } from '../../../../store/slices/chatSlice';
import { createPrivateChatHubConnection } from '../../../../services/signalr';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../../../../services/api';

import CreateOfferModal from '../components/CreateOfferModal';
import ChatInput from '../components/ChatInput';
import MessageBubble from '../components/MessageBubble';

export default function PrivateChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentChat, loading } = useSelector((state: RootState) => state.chat);
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [sending, setSending] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchPrivateChat(id as string));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!currentChat?.id || !token) return;

    let isMounted = true;
    const connection = createPrivateChatHubConnection(token);

    const startConnection = async () => {
      try {
        await connection.start();
        if (isMounted) {
          console.log('Connected to Private Chat Hub');
          await connection.invoke('JoinChat', currentChat.id.toString());
          connectionRef.current = connection;
        } else {
          await connection.stop();
        }
      } catch (err) {
        console.error('Private Chat Hub Start Error: ', err);
      }
    };

    connection.on('ReceiveMessage', (message) => {
      dispatch(addLocalMessage(message));
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    connection.on('ReceiveCustomOffer', (payload) => {
      const message = {
        id: 'offer_' + payload.customOffer.id,
        chatId: payload.chatId,
        senderId: payload.senderId,
        content: `أرسل عرضاً مخصصاً: ${payload.customOffer.title}`,
        sentAt: new Date().toISOString(),
        customOffer: payload.customOffer
      };
      dispatch(addLocalMessage(message));
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    startConnection();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected || connection.state === signalR.HubConnectionState.Connecting) {
        connection.stop().catch(e => console.log('Stop error ignored:', e));
      }
    };
  }, [currentChat?.id, token, dispatch]);

  const handleSend = async (content?: string, attachment?: any, type: string = 'file') => {
    if (!content?.trim() && !attachment) return;
    setSending(true);
    try {
      await dispatch(sendMessage({ 
        chatId: currentChat.id, 
        content: content || '', 
        attachment, 
        attachmentType: type 
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

  const partnerName = currentChat?.messages?.find((m: any) => m.senderId !== user?.id)?.senderName || 'محادثة خاصة';

  const extraButtons = user?.isExecutor ? (
    <Pressable style={styles.attachBtn} onPress={() => setOfferModalVisible(true)} disabled={sending}>
      <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
    </Pressable>
  ) : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{partnerName}</Text>
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
            <Text style={{ color: Colors.textSecondary }}>ابدأ المحادثة الآن</Text>
          </View>
        }
      />

      <ChatInput onSend={handleSend} sending={sending} extraButtons={extraButtons} />

      {currentChat && (
        <CreateOfferModal 
          visible={offerModalVisible} 
          onClose={() => setOfferModalVisible(false)} 
          chatId={currentChat.id} 
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.white, boxShadow: [{ color: 'rgba(0, 0, 0, 0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }], elevation: 2, zIndex: 10 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  headerStatus: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  chatList: { padding: 24, paddingBottom: 16 },
  attachBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});