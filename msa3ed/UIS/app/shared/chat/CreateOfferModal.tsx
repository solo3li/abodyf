import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../components/Button';

interface CreateOfferModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CreateOfferModal({ visible, onClose, onSubmit }: CreateOfferModalProps) {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description || !price || !deliveryDays) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        description,
        price: parseFloat(price),
        deliveryDays: parseInt(deliveryDays)
      });
      setDescription('');
      setPrice('');
      setDeliveryDays('');
      onClose();
    } catch (error) {
      // Handled by caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>إنشاء عرض خاص</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>وصف العرض</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="اكتب تفاصيل الخدمة التي ستقدمها..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>السعر (EGP)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>مدة التسليم (أيام)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  keyboardType="numeric"
                  value={deliveryDays}
                  onChangeText={setDeliveryDays}
                />
              </View>
            </View>

            <Button
              title="إرسال العرض"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  col: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 16,
  },
});
