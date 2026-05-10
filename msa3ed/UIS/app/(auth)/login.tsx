import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { login, verifyOtp } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setErrorMessage(null);
    const result = await dispatch(login({ email, password }));
    setLoading(false);
    
    if (login.fulfilled.match(result)) {
      setIsOtpStep(true);
    } else {
      const errorMsg = result.payload as string;
      if (errorMsg === 'EMAIL_NOT_VERIFIED') {
        setErrorMessage('الرجاء تفعيل حسابك عبر الرابط المرسل لبريدك الإلكتروني أولاً.');
      } else {
        setErrorMessage(errorMsg || 'فشل تسجيل الدخول. يرجى التأكد من البيانات.');
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) return;
    setLoading(true);
    setErrorMessage(null);
    const result = await dispatch(verifyOtp({ email, otpCode }));
    setLoading(false);
    
    if (verifyOtp.fulfilled.match(result)) {
      router.replace('/student');
    } else {
      setErrorMessage(result.payload as string || 'رمز التحقق غير صحيح. حاول مرة أخرى.');
    }
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
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subtitle}>أهلاً بك مجدداً في UIS</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.form}>
          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={Colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {!isOtpStep ? (
            <>
              <Input 
                icon="mail-outline"
                placeholder="البريد الإلكتروني"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Input 
                icon="lock-closed-outline"
                placeholder="كلمة المرور"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPassword}>نسيت كلمة المرور؟</Text>
              </Pressable>

              <Button 
                title="تسجيل الدخول"
                onPress={handleLogin}
                loading={loading}
                disabled={!email || !password}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>أو سجل عبر</Text>
                <View style={styles.divider} />
              </View>

              <Pressable style={styles.googleButton}>
                <Ionicons name="logo-google" size={22} color={Colors.error} style={{ marginRight: 12 }} />
                <Text style={styles.googleButtonText}>حساب Google</Text>
              </Pressable>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
                <Pressable onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.registerLink}>أنشئ حساباً جديداً</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={{ textAlign: 'center', marginBottom: 20, color: Colors.textSecondary, fontSize: 16 }}>
                تم إرسال رمز التحقق إلى بريدك الإلكتروني
              </Text>
              
              <Input 
                icon="keypad-outline"
                placeholder="رمز التحقق (OTP)"
                keyboardType="number-pad"
                maxLength={4}
                value={otpCode}
                onChangeText={setOtpCode}
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
              />

              <Button 
                title="تأكيد وتسجيل الدخول"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={!otpCode || otpCode.length < 4}
              />
              
              <View style={styles.registerContainer}>
                <Pressable onPress={() => { setIsOtpStep(false); setErrorMessage(null); }}>
                  <Text style={styles.registerLink}>العودة للخلف</Text>
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topDecoration: { position: 'absolute', top: -width * 0.4, left: -width * 0.2, width: width * 1.4, height: width * 1.4, opacity: 0.1 },
  gradientCircle: { flex: 1, borderRadius: width * 0.7 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 40, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 18, color: Colors.textSecondary, fontWeight: '500' },
  form: { gap: 0 },
  errorBox: { flexDirection: 'row', backgroundColor: Colors.error + '15', padding: 12, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  errorText: { color: Colors.error, fontSize: 14, fontWeight: 'bold', marginLeft: 8, flex: 1, textAlign: 'right' },
  forgotPasswordContainer: { alignSelf: 'flex-start', marginBottom: 24, marginTop: -8 },
  forgotPassword: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 16, color: Colors.textSecondary, fontWeight: '500' },
  googleButton: { flexDirection: 'row', backgroundColor: Colors.white, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, elevation: 1 },
  googleButtonText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: Colors.textSecondary, fontSize: 16 },
  registerLink: { color: Colors.primary, fontSize: 16, fontWeight: 'bold' },
});
