import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { fetchTicketById, replyToTicket, addLocalTicketMessage } from '../../../../store/slices/ticketsSlice';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../../../../services/api';

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTicket: ticket, loading } = useSelector((state: RootState) => state.tickets);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [isRecording, setIsRecording] = useState(false);
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
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        if (isMounted) {
          console.log('Connected to Ticket Hub');
          await connection.invoke('JoinChat', "ticket-" + id);
          connectionRef.current = connection;
        } else {
          await connection.stop();
        }
      } catch (err) {
        console.error('Ticket Hub Start Error: ', err);
      }
    };

    connection.on('ReceiveTicketMessage', (message) => {
      dispatch(addLocalTicketMessage(message));
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    startConnection();

    return () => {
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected || connection.state === signalR.HubConnectionState.Connecting) {
        connection.stop().catch(e => console.log('Stop error ignored:', e));
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
      setInputText('');
    } catch (err: any) {
      alert('فشل في إرسال الرد: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || 'upload.jpg',
        type: asset.mimeType || 'image/jpeg',
      };
      await handleSend('', file, 'image');
    }
  };

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(undefined);

    if (uri) {
        const file = {
            uri,
            name: 'voice_note.m4a',
            type: 'audio/m4a'
        };
        await handleSend('', file, 'voice');
    }
  }

  const renderMessage = ({ item }: any) => {
    const isSender = item.senderId === user?.id;
    return (
      <View style={[styles.messageBubble, isSender ? styles.userBubble : styles.supportBubble]}>
        {item.content ? <Text style={[styles.messageText, isSender ? styles.userText : styles.supportText]}>{item.content}</Text> : null}
        
        {item.attachmentUrl && item.attachmentType === 'image' && (
            <Image source={{ uri: item.attachmentUrl }} style={styles.messageImage} resizeMode="cover" />
        )}

        {item.attachmentUrl && item.attachmentType === 'voice' && (
            <View style={styles.voiceContainer}>
                <Ionicons name="play-circle" size={32} color={isSender ? Colors.primary : Colors.white} />
                <View style={[styles.voiceWave, { backgroundColor: isSender ? Colors.primary + '20' : 'rgba(255,255,255,0.3)' }]} />
                <Text style={[styles.voiceText, { color: isSender ? Colors.textSecondary : 'rgba(255,255,255,0.8)' }]}>مقطع صوتي</Text>
            </View>
        )}

        {item.attachmentUrl && item.attachmentType === 'file' && (
            <View style={styles.fileContainer}>
                <Ionicons name="document-attach" size={24} color={isSender ? Colors.primary : Colors.white} />
                <Text style={[styles.fileText, { color: isSender ? Colors.text : Colors.white }]} numberOfLines={1}>ملف مرفق</Text>
            </View>
        )}

        <Text style={[styles.timeText, isSender ? styles.userTime : styles.supportTime]}>
            {new Date(item.sentAt || item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
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

      <View style={styles.inputContainer}>
        <Pressable style={styles.attachBtn} onPress={pickImage} disabled={sending || isRecording}>
          <Ionicons name="image" size={24} color={Colors.textSecondary} />
        </Pressable>

        <TextInput 
          style={styles.input} 
          placeholder={isRecording ? "جاري التسجيل..." : "اكتب ردك هنا..."}
          placeholderTextColor={isRecording ? Colors.error : Colors.textSecondary}
          multiline
          value={inputText}
          onChangeText={setInputText}
          editable={!isRecording && !sending}
        />

        {inputText.length > 0 ? (
          <Pressable style={styles.sendBtn} onPress={() => handleSend(inputText)} disabled={sending}>
            {sending ? <ActivityIndicator size="small" color={Colors.white} /> : <Ionicons name="send" size={20} color={Colors.white} style={{ marginLeft: 4 }} />}
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.sendBtn, isRecording && { backgroundColor: Colors.error }]} 
            onPress={isRecording ? stopRecording : startRecording}
            disabled={sending}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={20} color={Colors.white} />
          </Pressable>
        )}
      </View>
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
  messageBubble: { maxWidth: '85%', padding: 16, borderRadius: 20, marginBottom: 12, boxShadow: [{ color: 'rgba(0, 0, 0, 0.05)', offsetX: 0, offsetY: 2, blurRadius: 5, spreadDistance: 0 }], elevation: 1 },
  userBubble: { alignSelf: 'flex-start', backgroundColor: Colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  supportBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  userText: { color: Colors.text },
  supportText: { color: Colors.white },
  messageImage: { width: 200, height: 200, borderRadius: 12, marginTop: 8 },
  voiceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  voiceWave: { flex: 1, height: 4, borderRadius: 2 },
  voiceText: { fontSize: 12, fontWeight: 'bold' },
  fileContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8, padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 },
  fileText: { fontSize: 13, fontWeight: '600' },
  timeText: { fontSize: 10, marginTop: 8, alignSelf: 'flex-end', fontWeight: 'bold' },
  userTime: { color: Colors.textSecondary },
  supportTime: { color: 'rgba(255,255,255,0.7)' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  attachBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, minHeight: 44, maxHeight: 100, backgroundColor: Colors.background, borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: Colors.text, textAlign: 'right' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
});
