import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../../services/api';
import Button from '../../../components/Button';

export default function ProjectDetailsAndBiddingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Bidding state
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedDays, setProposedDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await apiFetch(`/Projects/${id}`);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleSubmitOffer = async () => {
    if (!proposedPrice || !proposedDays || !coverLetter) {
      alert('الرجاء ملء جميع تفاصيل العرض');
      return;
    }
    
    setSubmitting(true);
    try {
      await apiFetch(`/Projects/${id}/Offers`, {
        method: 'POST',
        body: JSON.stringify({
          proposedPrice: parseFloat(proposedPrice),
          proposedDays: parseInt(proposedDays),
          coverLetter
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      alert('تم تقديم العرض بنجاح');
      router.back();
    } catch (err: any) {
      alert('حدث خطأ أثناء تقديم العرض: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text>المشروع غير موجود</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>تفاصيل المشروع</Text>
      </View>

      <View style={styles.projectCard}>
        <Text style={styles.title}>{project.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{project.categoryName}</Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>ميزانية: {project.budget} ج.م</Text>
        </View>
        <Text style={styles.description}>{project.description}</Text>
      </View>

      <View style={styles.biddingSection}>
        <Text style={styles.sectionTitle}>تقديم عرض</Text>
        
        <Text style={styles.label}>السعر المقترح (ج.م)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="مثال: 500"
          value={proposedPrice}
          onChangeText={setProposedPrice}
        />

        <Text style={styles.label}>مدة التنفيذ (بالأيام)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="مثال: 3"
          value={proposedDays}
          onChangeText={setProposedDays}
        />

        <Text style={styles.label}>تفاصيل العرض</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={5}
          placeholder="أخبر العميل لماذا أنت الأنسب لهذا المشروع..."
          value={coverLetter}
          onChangeText={setCoverLetter}
          textAlignVertical="top"
        />

        <Button 
          title="تأكيد تقديم العرض" 
          onPress={handleSubmitOffer} 
          loading={submitting} 
          style={{ marginTop: 24 }} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', padding: 24, paddingTop: 60, gap: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  projectCard: { padding: 24, backgroundColor: Colors.background, marginHorizontal: 24, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text, textAlign: 'right', marginBottom: 12 },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 16 },
  metaText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textSecondary, marginHorizontal: 8 },
  description: { fontSize: 15, color: Colors.textSecondary, textAlign: 'right', lineHeight: 24 },
  biddingSection: { padding: 24, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, textAlign: 'right', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: 'bold', color: Colors.text, textAlign: 'right', marginBottom: 8, marginTop: 16 },
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
});
