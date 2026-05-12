import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import ServiceForm from '../../../components/ServiceForm';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { createService, resetStatus } from '../../../store/slices/servicesSlice';
import { fetchCategories } from '../../../store/slices/catalogSlice';
import { Ionicons } from '@expo/vector-icons';

export default function CreateServiceScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success } = useSelector((state: RootState) => state.services);
  const { categories } = useSelector((state: RootState) => state.catalog);

  React.useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  React.useEffect(() => {
    if (success) {
      dispatch(resetStatus());
      router.back();
    }
  }, [success, router, dispatch]);

  const handleSubmit = async (data: any, image: any) => {
    await dispatch(createService({ data, image }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>إضافة خدمة جديدة</Text>
      </View>
      <ServiceForm onSubmit={handleSubmit} loading={loading} categories={categories} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
});
