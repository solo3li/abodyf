import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { useEffect } from 'react';
import { fetchKycStatus } from '../../store/slices/kycSlice';

export default function KycStatusScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { status, rejectionReason, loading } = useSelector((state: RootState) => state.kyc);

  useEffect(() => {
    dispatch(fetchKycStatus());
  }, [dispatch]);

  const getStatusDisplay = () => {
    if (status === 'Approved') {
      return { icon: 'checkmark-circle', color: Colors.success, title: 'تم قبول طلبك', desc: 'تهانينا! يمكنك الآن العمل كمنفذ وتصفح الطلبات المتاحة.' };
    } else if (status === 'Rejected') {
      return { icon: 'close-circle', color: Colors.error, title: 'تم رفض طلبك', desc: rejectionReason || 'عذراً، لم يتم قبول طلبك.' };
    }
    // Pending or null
    return { icon: 'time', color: Colors.warning, title: 'طلبك قيد المراجعة', desc: 'شكراً لك، لقد تم استلام بياناتك بنجاح. يقوم فريقنا حالياً بمراجعتها وسنقوم بإعلامك بالنتيجة في أقرب وقت ممكن.' };
  };

  const display = getStatusDisplay();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.replace('/student/profile')}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>حالة طلب KYC</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: display.color + '15' }]}>
          <Ionicons name={display.icon as any} size={80} color={display.color} />
        </View>
        <Text style={styles.title}>{display.title}</Text>
        <Text style={styles.description}>{display.desc}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={() => router.replace('/student')}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <Text style={styles.btnText}>العودة للرئيسية</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconContainer: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  description: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 26 },
  footer: { padding: 24, paddingBottom: 48 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});
