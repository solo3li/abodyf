import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { createTicket } from '../../../store/slices/ticketsSlice';

export default function NewTicketScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      alert('يرجى إدخال عنوان التذكرة');
      return;
    }
    
    setLoading(true);
    try {
      // API expects subject only or more? We just pass subject for now as per ticketSlice.ts
      // But we can append details to subject if needed, or update API later.
      const fullSubject = details ? `${subject} - ${details}` : subject;
      await dispatch(createTicket(fullSubject)).unwrap();
      alert('تم فتح التذكرة بنجاح');
      router.back();
    } catch (error: any) {
      alert('حدث خطأ أثناء فتح التذكرة: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>تذكرة جديدة</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>عنوان التذكرة</Text>
          <TextInput 
            style={styles.input} 
            placeholder="مثال: مشكلة في الدفع، تأخير طلب..." 
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>رقم الطلب (اختياري)</Text>
          <TextInput style={styles.input} placeholder="مثال: ORD-2023-001" />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>التفاصيل</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="يرجى كتابة كافة تفاصيل المشكلة هنا..." 
            multiline 
            numberOfLines={6}
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>المرفقات (اختياري)</Text>
          <Pressable style={styles.uploadBox}>
            <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
            <Text style={styles.uploadText}>اضغط هنا لرفع صور أو ملفات توضح المشكلة</Text>
          </Pressable>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtn}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>فتح التذكرة</Text>}
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.white, boxShadow: [{ color: 'rgba(0, 0, 0, 0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }], elevation: 2, zIndex: 10 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  content: { padding: 24, paddingBottom: 100 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  input: { height: 56, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: Colors.text, textAlign: 'right', borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 120, paddingTop: 16 },
  uploadBox: { height: 120, backgroundColor: Colors.white, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed' },
  uploadText: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  submitBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});
