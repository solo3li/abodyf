import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeInRight, FadeOutLeft, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { ONBOARDING_DATA } from '../constants/dummyData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const item = ONBOARDING_DATA[currentIndex];

  const getIcon = (id: string) => {
    if (id === '1') return 'school';
    if (id === '2') return 'rocket';
    return 'shield-checkmark';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.skipText}>تخطي</Text>
        </Pressable>
      </View>

      <Animated.View
        key={item.id}
        entering={FadeInRight.duration(600).springify()}
        exiting={FadeOutLeft.duration(400)}
        style={styles.content}
      >
        <Animated.View entering={ZoomIn.delay(300)} style={styles.imagePlaceholder}>
          <LinearGradient
            colors={[Colors.primary + '20', Colors.secondary + '40']}
            style={styles.imageGradient}
          >
            <Ionicons name={getIcon(item.id) as any} size={120} color={Colors.primary} />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        <Pressable onPress={onNext}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'ابدأ رحلتك' : 'التالي'}
            </Text>
            <Ionicons name="arrow-back-outline" size={20} color={Colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'flex-start',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  imagePlaceholder: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: Colors.white,
    marginBottom: 40,
    boxShadow: [{ color: 'rgba(99, 102, 241, 0.15)', offsetX: 0, offsetY: 20, blurRadius: 30, spreadDistance: 0 }],
    elevation: 10,
    overflow: 'hidden',
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  activeDot: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  button: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(99, 102, 241, 0.3)', offsetX: 0, offsetY: 10, blurRadius: 20, spreadDistance: 0 }],
    elevation: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
