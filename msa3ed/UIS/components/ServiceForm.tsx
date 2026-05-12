import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import Input from './Input';
import Button from './Button';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface ServiceFormProps {
  initialData?: any;
  onSubmit: (data: any, image?: any) => Promise<void>;
  loading: boolean;
  categories: any[];
}

export default function ServiceForm({ initialData, onSubmit, loading, categories }: ServiceFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.basePrice?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [deliveryDays, setDeliveryDays] = useState(initialData?.deliveryDays?.toString() || '');
  const [revisions, setRevisions] = useState(initialData?.revisions?.toString() || '0');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [image, setImage] = useState<any>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleHandleSubmit = async () => {
    if (!title || !description || !price || !categoryId || !deliveryDays) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    const data = {
      title,
      description,
      basePrice: parseFloat(price),
      categoryId,
      estimatedDeliveryDays: parseInt(deliveryDays),
      includedRevisions: parseInt(revisions),
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
    };

    await onSubmit(data, image);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>عنوان الخدمة *</Text>
      <Input value={title} onChangeText={setTitle} placeholder="مثال: تصميم شعار احترافي" />

      <Text style={styles.label}>الوصف *</Text>
      <Input value={description} onChangeText={setDescription} placeholder="اشرح تفاصيل خدمتك..." multiline />

      <Text style={styles.label}>السعر الأساسي (ج.م) *</Text>
      <Input value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" />

      <Text style={styles.label}>مدة التسليم (أيام) *</Text>
      <Input value={deliveryDays} onChangeText={setDeliveryDays} placeholder="عدد الأيام" keyboardType="numeric" />

      <Text style={styles.label}>عدد المراجعات</Text>
      <Input value={revisions} onChangeText={setRevisions} placeholder="0" keyboardType="numeric" />

      <Text style={styles.label}>الكلمات المفتاحية (تفصل بينها فاصلة)</Text>
      <Input value={tags} onChangeText={setTags} placeholder="React, Node.js, برمجة" />

      <Text style={styles.label}>صورة الخدمة</Text>
      <Button 
        onPress={pickImage} 
        variant="outline" 
        style={styles.imageBtn}
      >
        <View style={styles.imageBtnContent}>
          <Ionicons name="image-outline" size={24} color={Colors.primary} />
          <Text style={styles.imageBtnText}>{image ? 'تم اختيار صورة' : 'اختر صورة غلاف'}</Text>
        </View>
      </Button>

      <Button 
        title={initialData ? "تحديث الخدمة" : "إنشاء الخدمة"} 
        onPress={handleHandleSubmit} 
        loading={loading}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 24, paddingBottom: 100 },
  label: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8, marginTop: 16 },
  imageBtn: { borderStyle: 'dashed', height: 120, justifyContent: 'center' },
  imageBtnContent: { alignItems: 'center', gap: 8 },
  imageBtnText: { color: Colors.primary, fontWeight: 'bold' },
  submitBtn: { marginTop: 32 }
});
