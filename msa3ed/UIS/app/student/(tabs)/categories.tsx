import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect } from 'react';
import { fetchCategories } from '../../../store/slices/catalogSlice';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../../services/api';

const { width } = Dimensions.get('window');

const getApiUrl = (path: string) => path ? (path.startsWith('http') ? path : API_BASE_URL + path) : 'https://placehold.co/150';

export default function CategoriesScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector((state: RootState) => state.catalog);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>أقسام الخدمات</Text>
      </View>
      
      {loading && categories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {categories.map((cat: any, index: number) => (
            <Animated.View key={cat.id} entering={FadeInUp.delay(index * 50)} style={styles.cardWrapper}>
              <Pressable style={styles.card} onPress={() => router.push(`/student/service/${cat.id}`)}>
                <LinearGradient
                  colors={[cat.color || Colors.primary, Colors.white]}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={(cat.icon || 'list') as any} size={36} color={Colors.primary} />
                  </View>
                  <Text style={styles.title}>{cat.name || cat.title}</Text>
                  <Text style={styles.subtitle}>تصفح الخدمات</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.white,
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }],
    elevation: 2,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  grid: {
    padding: 24,
    paddingBottom: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: width / 2 - 32,
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 3,
  },
  cardGradient: {
    padding: 24,
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: [{ color: 'rgba(99, 102, 241, 0.1)', offsetX: 0, offsetY: 4, blurRadius: 8, spreadDistance: 0 }],
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
