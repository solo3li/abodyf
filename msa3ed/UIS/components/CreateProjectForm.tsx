import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import Button from './Button';

interface CreateProjectFormProps {
  onSubmit: (data: any) => void;
  categories: any[];
}

export default function CreateProjectForm({ onSubmit, categories }: CreateProjectFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = () => {
    if (!title || !description || !budget || !deadlineDays || !categoryId) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + parseInt(deadlineDays));

    onSubmit({
      title,
      description,
      budget: parseFloat(budget),
      deadline: deadline.toISOString(),
      categoryId,
      isPublic: true
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>عنوان المشروع</Text>
      <TextInput
        style={styles.input}
        placeholder="عنوان المشروع"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>التصنيف</Text>
      <View style={styles.categories}>
        {categories.map(c => (
          <Pressable 
            key={c.id} 
            style={[styles.catChip, categoryId === c.id && styles.catChipActive]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text style={[styles.catText, categoryId === c.id && styles.catTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>الوصف</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="تفاصيل المشروع..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={styles.label}>الميزانية المتوقعة</Text>
      <TextInput
        style={styles.input}
        placeholder="الميزانية (ج.م)"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />

      <Text style={styles.label}>المدة المتوقعة للتسليم</Text>
      <TextInput
        style={styles.input}
        placeholder="عدد الأيام للتقديم"
        value={deadlineDays}
        onChangeText={setDeadlineDays}
        keyboardType="numeric"
      />

      <Button title="نشر المشروع" onPress={handleSubmit} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: Colors.white },
  label: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8, textAlign: 'right', marginTop: 16 },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right'
  },
  textArea: { height: 120 },
  categories: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 14, color: Colors.textSecondary },
  catTextActive: { color: Colors.white, fontWeight: 'bold' }
});
