import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCategories } from '../../../store/slices/catalogSlice';
import CreateProjectForm from '../../../components/CreateProjectForm';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../../services/api';

export default function CreateProjectScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector((state: RootState) => state.catalog);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch]);

  const handleSubmit = async (data: any) => {
    try {
      await apiFetch('/Projects', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      alert('تم إضافة المشروع بنجاح!');
      router.replace('/student/projects/mine' as any);
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>طلب مشروع خاص</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <CreateProjectForm onSubmit={handleSubmit} categories={categories} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row-reverse', alignItems: 'center', padding: 24, paddingTop: 60, gap: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
});
