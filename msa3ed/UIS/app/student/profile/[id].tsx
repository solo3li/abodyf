import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../../services/api';
import WorkGallery from '../../../components/WorkGallery';
import Button from '../../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ExecutorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [executor, setExecutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch(`/Executors/${id}`);
        setExecutor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!executor) {
    return (
      <View style={styles.centered}>
        <Text>لم يتم العثور على المنفذ</Text>
      </View>
    );
  }

  const handleChat = async () => {
    try {
      // Logic to initiate or find existing chat
      const chat = await apiFetch('/Chat/Private/Initiate', { 
        method: 'POST',
        body: JSON.stringify({ executorId: executor.id }),
        headers: { 'Content-Type': 'application/json' }
      });
      router.push(`/shared/chat/${chat.id}`);
    } catch (err) {
      alert('فشل في بدء المحادثة');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Background */}
      <View style={styles.headerBg}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <Image 
          source={{ uri: executor.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(executor.fullName) }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{executor.fullName}</Text>
        <Text style={styles.major}>{executor.major || 'خبير أكاديمي'}</Text>
        <Text style={styles.uni}>{executor.university}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{executor.rating}</Text>
            <Text style={styles.statLabel}>التقييم</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{executor.completedOrdersCount}</Text>
            <Text style={styles.statLabel}>طلب مكتمل</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button 
            title="تحدث الآن" 
            onPress={handleChat} 
            icon="chatbubbles-outline" 
            style={styles.chatBtn}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>عن المنفذ</Text>
        <Text style={styles.bio}>{executor.bio || 'لا يوجد وصف متاح حالياً.'}</Text>
      </View>

      <WorkGallery items={executor.gallery} />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBg: { height: 160, paddingHorizontal: 24, paddingTop: 60 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  profileCard: {
    marginTop: -60,
    marginHorizontal: 24,
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 10, blurRadius: 30, spreadDistance: 0 }],
    elevation: 10,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.white, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  major: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginTop: 4 },
  uni: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  stats: { flexDirection: 'row-reverse', marginTop: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  actions: { marginTop: 24, width: '100%' },
  chatBtn: { width: '100%' },
  section: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12, textAlign: 'right' },
  bio: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, textAlign: 'right' },
});
