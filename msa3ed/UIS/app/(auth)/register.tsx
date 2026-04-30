import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { register } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    const result = await dispatch(register({ fullName, email, password }));
    setLoading(false);
    if (register.fulfilled.match(result)) {
      alert('تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.');
      router.replace('/(auth)/login');
    } else {
      alert('فشل إنشاء الحساب: ' + (result.payload || 'خطأ غير معروف'));
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
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-forward" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>إنشاء حساب</Text>
          <Text style={styles.subtitle}>سجل الآن وابدأ رحلتك معنا</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.form}>
          <Input 
            icon="person-outline"
            placeholder="الاسم الكامل"
            value={fullName}
            onChangeText={setFullName}
          />

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

          <Button 
            title="تسجيل"
            onPress={handleRegister}
            loading={loading}
            disabled={!fullName || !email || !password}
            style={{ marginTop: 12 }}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>لديك حساب بالفعل؟ </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.registerLink}>تسجيل الدخول</Text>
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
  header: { marginBottom: 32 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 18, color: Colors.textSecondary, fontWeight: '500' },
  form: { gap: 0 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: Colors.textSecondary, fontSize: 16 },
  registerLink: { color: Colors.primary, fontSize: 16, fontWeight: 'bold' },
});
