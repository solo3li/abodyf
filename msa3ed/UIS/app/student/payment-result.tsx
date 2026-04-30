import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';

export default function PaymentResultScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(800)} style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color={Colors.success} />
        </Animated.View>
        <Text style={styles.title}>تم الدفع بنجاح!</Text>
        <Text style={styles.description}>
          لقد تم استلام طلبك ودفع المبلغ بنجاح. سيقوم المنفذ بالبدء في العمل قريباً.
        </Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>رقم الطلب:</Text>
            <Text style={styles.detailValue}>#ORD-2023-007</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>المبلغ المدفوع:</Text>
            <Text style={styles.detailValue}>165 ج.م</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={() => router.replace('/student/orders')} style={{ marginBottom: 16 }}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <Text style={styles.btnText}>متابعة الطلب</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => router.replace('/student')} style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconContainer: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, marginBottom: 16 },
  description: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 26, marginBottom: 32 },
  detailsCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 16, color: Colors.textSecondary },
  detailValue: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  footer: { padding: 24, paddingBottom: 48 },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
  btnOutline: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.primary },
  btnOutlineText: { color: Colors.primary, fontSize: 18, fontWeight: 'bold' },
});
