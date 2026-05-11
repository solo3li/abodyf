import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import { sendCustomOffer } from '../../../../store/slices/chatSlice';

interface CreateOfferModalProps {
  visible: boolean;
  onClose: () => void;
  chatId: string;
}

export default function CreateOfferModal({ visible, onClose, chatId }: CreateOfferModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !price || !deliveryDays) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      await dispatch(sendCustomOffer({
        chatId,
        title,
        description,
        price: parseFloat(price),
        deliveryDays: parseInt(deliveryDays, 10),
      })).unwrap();
      
      setTitle('');
      setDescription('');
      setPrice('');
      setDeliveryDays('');
      onClose();
    } catch (err: any) {
      alert('فشل في إرسال العرض: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>إنشاء عرض مخصص</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>عنوان العرض</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="مثال: تصميم شعار احترافي" />

            <Text style={styles.label}>التفاصيل</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="وصف مفصل لما ستقدمه..." multiline numberOfLines={4} />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>السعر (ج.م)</Text>
                <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0" keyboardType="numeric" />
              </View>
              <View style={{ width: 16 }} />
              <View style={styles.flex1}>
                <Text style={styles.label}>مدة التسليم (أيام)</Text>
                <TextInput style={styles.input} value={deliveryDays} onChangeText={setDeliveryDays} placeholder="0" keyboardType="numeric" />
              </View>
            </View>

            <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>إرسال العرض</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: Colors.text, marginBottom: 8, textAlign: 'left' },
  input: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, fontSize: 16, textAlign: 'right', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  submitBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});