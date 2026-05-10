import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import Button from './Button';
import { Ionicons } from '@expo/vector-icons';

interface OfferCardProps {
  offer: {
    id: string;
    description: string;
    price: number;
    deliveryDays: number;
    status: string;
  };
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onWithdraw?: (id: string) => void;
  isStudent: boolean;
}

export default function OfferCard({ offer, onAccept, onDecline, onWithdraw, isStudent }: OfferCardProps) {
  const isPending = offer.status === 'Pending';
  const isExecutor = !isStudent;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="gift-outline" size={24} color={Colors.primary} />
        <Text style={styles.title}>عرض خاص</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) }]}>
          <Text style={styles.statusText}>{offer.status}</Text>
        </View>
      </View>

      <Text style={styles.description}>{offer.description}</Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{offer.price} EGP</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{offer.deliveryDays} أيام</Text>
        </View>
      </View>

      {isStudent && isPending && (
        <View style={styles.actions}>
          <Button
            title="قبول العرض"
            onPress={() => onAccept?.(offer.id)}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />
          <Button
            title="رفض"
            variant="outline"
            onPress={() => onDecline?.(offer.id)}
            style={[styles.actionButton, styles.declineButton]}
            textStyle={styles.declineButtonText}
          />
        </View>
      )}

      {isExecutor && isPending && (
        <View style={styles.actions}>
          <Button
            title="سحب العرض"
            variant="outline"
            onPress={() => onWithdraw?.(offer.id)}
            style={[styles.actionButton, styles.declineButton]}
            textStyle={styles.declineButtonText}
          />
        </View>
      )}
    </View>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Pending': return Colors.primary;
    case 'Accepted': return Colors.success;
    case 'Declined': return Colors.error;
    case 'Withdrawn': return Colors.textSecondary;
    case 'Expired': return '#9CA3AF';
    default: return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
    textAlign: 'left',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'left',
  },
  details: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 44,
  },
  actionButtonText: {
    fontSize: 14,
  },
  declineButton: {
    borderColor: Colors.error,
  },
  declineButtonText: {
    color: Colors.error,
  },
});
