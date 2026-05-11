import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { acceptCustomOffer } from '../../../../store/slices/chatSlice';
import { useRouter } from 'expo-router';

interface CustomOfferWidgetProps {
  offer: {
    id: string;
    title: string;
    description: string;
    price: number;
    deliveryDays: number;
    status: string;
    executorId: string;
  };
}

export default function CustomOfferWidget({ offer }: CustomOfferWidgetProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const isExecutor = user?.id === offer.executorId;
  const canAccept = !isExecutor && offer.status === 'Pending';

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await dispatch(acceptCustomOffer(offer.id)).unwrap();
      router.push(`/shared/order/${response.orderId}`); // Or checkout page if you want payment first
    } catch (err: any) {
      alert('فشل في قبول العرض: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (offer.status) {
      case 'Accepted': return Colors.success;
      case 'Rejected': return Colors.error;
      default: return Colors.warning;
    }
  };

  const getStatusText = () => {
    switch (offer.status) {
      case 'Accepted': return 'مقبول';
      case 'Rejected': return 'مرفوض';
      default: return 'قيد الانتظار';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{offer.title}</Text>
          <Text style={[styles.status, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={3}>{offer.description}</Text>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>السعر</Text>
          <Text style={styles.detailValue}>{offer.price} ج.م</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>التسليم</Text>
          <Text style={styles.detailValue}>{offer.deliveryDays} أيام</Text>
        </View>
      </View>

      {canAccept && (
        <Pressable style={styles.acceptBtn} onPress={handleAccept} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.acceptBtnText}>قبول العرض</Text>}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: 260,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.text, textAlign: 'left' },
  status: { fontSize: 12, fontWeight: '600', marginTop: 2, textAlign: 'left' },
  description: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, textAlign: 'left', lineHeight: 20 },
  detailsRow: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 12, padding: 12, marginBottom: 16 },
  detailItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: Colors.border },
  detailLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  acceptBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 12, alignItems: 'center' },
  acceptBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },
});