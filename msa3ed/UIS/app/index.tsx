import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Colors } from '../constants/Colors';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/student');
      } else {
        router.replace('/onboarding');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View entering={ZoomIn.duration(1200)} style={styles.logoContainer}>
        <View style={styles.logoInner}>
          <Text style={styles.logoText}>UIS</Text>
        </View>
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(600).duration(1000)} style={styles.subtitle}>
        بوابتك للخدمات الجامعية
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoInner: {
    width: 110,
    height: 110,
    backgroundColor: Colors.white,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 10, blurRadius: 20, spreadDistance: 0 }],
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
