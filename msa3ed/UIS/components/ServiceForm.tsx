import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, Pressable } from 'react-native';
import { Colors } from '../constants/Colors';
import Input from './Input';
import Button from './Button';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../services/api';

interface ServiceFormProps {
  initialData?: any;
  onSubmit: (data: any, image?: any) => Promise<void>;
  loading: boolean;
  categories: any[];
}

const getApiUrl = (path: string) => path ? (path.startsWith('http') ? path : API_BASE_URL + path) : 'https://placehold.co/300x168';

export default function ServiceForm({ initialData, onSubmit, loading, categories }: ServiceFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.basePrice?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [deliveryDays, setDeliveryDays] = useState(initialData?.estimatedDeliveryDays?.toString() || initialData?.deliveryDays?.toString() || '');
  const [revisions, setRevisions] = useState(initialData?.includedRevisions?.toString() || initialData?.revisions?.toString() || '0');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [image, setImage] = useState<any>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج إلى إذن الوصول إلى الصور');
      return;
    }

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

  const handleSubmit = async () => {
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
      tags: tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''),
    };

    await onSubmit(data, image);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>عنوان الخدمة *</Text>
      <Input value={title} onChangeText={setTitle} placeholder="مثال: تصميم شعار احترافي" />

      <Text style={styles.label}>التصنيف *</Text>
      <View style={styles.categoryGrid}>
        {categories.map((cat) => (
          <Pressable 
            key={cat.id} 
            style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]} 
            onPress={() => setCategoryId(cat.id)}
          >
            <Text style={[styles.categoryText, categoryId === cat.id && styles.categoryTextActive]}>{cat.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>الوصف *</Text>
      <Input value={description} onChangeText={setDescription} placeholder="اشرح تفاصيل خدمتك..." multiline />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>السعر (ج.م) *</Text>
          <Input value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>التسليم (أيام) *</Text>
          <Input value={deliveryDays} onChangeText={setDeliveryDays} placeholder="0" keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.label}>عدد المراجعات</Text>
      <Input value={revisions} onChangeText={setRevisions} placeholder="0" keyboardType="numeric" />

      <Text style={styles.label}>الكلمات المفتاحية (تفصل بينها فاصلة)</Text>
      <Input value={tags} onChangeText={setTags} placeholder="React, Node.js, برمجة" />

      <Text style={styles.label}>صورة الخدمة</Text>
      <Pressable onPress={pickImage} style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
        ) : initialData?.imageUrl ? (
          <Image source={{ uri: getApiUrl(initialData.imageUrl) }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={Colors.primary} />
            <Text style={styles.imagePlaceholderText}>اضغط لاختيار صورة</Text>
          </View>
        )}
      </Pressable>

      <Button 
        title={initialData ? "تحديث الخدمة" : "إنشاء الخدمة"} 
        onPress={handleSubmit} 
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
  row: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: Colors.white },
  imageContainer: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.background, borderStyle: 'dashed', borderWidth: 2, borderColor: Colors.border, marginTop: 8 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  imagePlaceholderText: { color: Colors.primary, fontWeight: 'bold' },
  submitBtn: { marginTop: 32 }
});
