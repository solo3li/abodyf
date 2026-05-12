import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import ServiceForm from '../../../components/ServiceForm';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateService, fetchExecutorServices, pauseService, resumeService, resetStatus } from '../../../store/slices/servicesSlice';
import { fetchCategories } from '../../../store/slices/catalogSlice';
import { Ionicons } from '@expo/vector-icons';

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { executorServices, loading, success } = useSelector((state: RootState) => state.services);
  const { categories } = useSelector((state: RootState) => state.catalog);
  
  const service = executorServices.find((s: any) => s.id === id);

  useEffect(() => {
    dispatch(fetchCategories());
    if (!service) dispatch(fetchExecutorServices());
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      dispatch(resetStatus());
      router.back();
    }
  }, [success, router, dispatch]);

  const handleSubmit = async (data: any, image: any) => {
    await dispatch(updateService({ id: id as string, data, image }));
  };

  const handleToggleStatus = async () => {
    if (service.status === 'Active') {
      await dispatch(pauseService(id as string));
    } else if (service.status === 'Paused') {
      await dispatch(resumeService(id as string));
    }
    dispatch(fetchExecutorServices());
  };

  if (!service && loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!service) return <View style={styles.center}><Text>الخدمة غير موجودة</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>تعديل الخدمة</Text>
        <Pressable onPress={handleToggleStatus} style={styles.statusBtn}>
          <Ionicons name={service.status === 'Active' ? "pause-circle" : "play-circle"} size={28} color={service.status === 'Active' ? Colors.warning : Colors.success} />
        </Pressable>
      </View>
      <ServiceForm initialData={service} onSubmit={handleSubmit} loading={loading} categories={categories} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.text },
  statusBtn: { padding: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
