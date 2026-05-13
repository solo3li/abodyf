import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/api';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function EarningsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/Payments/Earnings');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderTransaction = ({ item, index }: any) => (
    <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons name={item.type === 'in' ? 'arrow-down' : 'arrow-up'} size={20} color={item.type === 'in' ? Colors.success : Colors.error} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString('ar-EG')}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.type === 'in' ? Colors.success : Colors.text }]}>
        {item.amount} ج.م
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>أرباحي</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={[Colors.primary, Colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد المتاح للسحب</Text>
          <Text style={styles.balanceValue}>{data?.total || 0} ج.م</Text>
          <View style={styles.balanceFooter}>
            <View>
              <Text style={styles.balanceSubLabel}>إجمالي المبيعات</Text>
              <Text style={styles.balanceSubValue}>{data?.total || 0} ج.م</Text>
            </View>
            <Pressable style={styles.withdrawBtn}>
              <Text style={styles.withdrawBtnText}>سحب الأرباح</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>آخر العمليات</Text>
        
        <View style={styles.transactionList}>
          {data?.transactions && data.transactions.length > 0 ? (
            data.transactions.map((item: any, index: number) => renderTransaction({ item, index }))
          ) : (
            <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: Colors.textSecondary }}>لا توجد عمليات حالياً</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.white, alignItems: 'center', boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }], elevation: 2, zIndex: 10 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  content: { padding: 24, paddingBottom: 120 },
  balanceCard: { borderRadius: 24, padding: 24, marginBottom: 32, boxShadow: [{ color: 'rgba(99, 102, 241, 0.3)', offsetX: 0, offsetY: 10, blurRadius: 20, spreadDistance: 0 }], elevation: 10 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 8 },
  balanceValue: { color: Colors.white, fontSize: 36, fontWeight: '900', marginBottom: 24 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16 },
  balanceSubLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  balanceSubValue: { color: Colors.white, fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  withdrawBtn: { backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  withdrawBtnText: { color: Colors.primary, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  transactionList: { backgroundColor: Colors.white, borderRadius: 20, padding: 16, boxShadow: [{ color: 'rgba(0,0,0,0.03)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }], elevation: 2 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  transactionInfo: { flex: 1, marginRight: 12 },
  transactionTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.text, marginBottom: 4, textAlign: 'right' },
  transactionDate: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
});
