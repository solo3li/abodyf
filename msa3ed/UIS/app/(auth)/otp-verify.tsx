import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { verifyOtp, login } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';

const { width } = Dimensions.get('window');

export default function OtpVerifyScreen() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState((initialEmail as string) || '');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (code.length < 4) {
      alert('يرجى إدخال رمز التحقق كاملاً');
      return;
    }
    const result = await dispatch(verifyOtp({ email, code }));
    if (verifyOtp.fulfilled.match(result)) {
      router.replace('/student');
    } else {
      alert('رمز التحقق غير صحيح أو انتهت صلاحيته');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setTimer(60);
    await dispatch(login({ email, password: '' }));
    alert('تم إعادة إرسال الرمز إلى بريدك الإلكتروني');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.topDecoration}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCircle}
        />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-forward" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>تأكيد الحساب</Text>
          <Text style={styles.subtitle}>أدخل رمز التحقق المكون من 4 أرقام المرسل إلى {email}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.form}>
          <View style={styles.otpContainer}>
             <Input 
              placeholder="0 0 0 0" 
              keyboardType="number-pad"
              maxLength={4}
              value={code}
              onChangeText={setCode}
              autoFocus
              style={styles.otpInput}
            />
          </View>

          <Button 
            title="تحقق الآن"
            onPress={handleVerify}
            loading={loading}
            disabled={code.length < 4}
            style={{ marginTop: 12 }}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>لم تستلم الرمز؟ </Text>
            <Pressable onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resendLink, timer > 0 && { color: Colors.textSecondary }]}>
                {timer > 0 ? `إعادة إرسال خلال (${timer}ث)` : 'إعادة إرسال الرمز'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topDecoration: {
    position: 'absolute', top: -width * 0.4, left: -width * 0.2, width: width * 1.4, height: width * 1.4, opacity: 0.1,
  },
  gradientCircle: { flex: 1, borderRadius: width * 0.7 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 48 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, fontWeight: '500', lineHeight: 24 },
  form: { gap: 0 },
  otpContainer: {
    marginBottom: 24,
  },
  otpInput: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 20,
    height: 80,
  },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  resendText: { color: Colors.textSecondary, fontSize: 16 },
  resendLink: { color: Colors.primary, fontSize: 16, fontWeight: 'bold' },
});
