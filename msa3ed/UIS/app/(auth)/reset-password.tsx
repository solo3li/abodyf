import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { resetPassword } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';

const { width } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState((initialEmail as string) || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (!email || !code || !newPassword) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    const result = await dispatch(resetPassword({ email, code, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      alert('تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.');
      router.replace('/(auth)/login');
    } else {
      alert('فشل إعادة تعيين كلمة المرور: ' + (result.payload || 'رمز التحقق غير صحيح'));
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
          <Text style={styles.title}>إعادة تعيين كلمة المرور</Text>
          <Text style={styles.subtitle}>أدخل رمز التحقق المرسل وكلمة المرور الجديدة</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.form}>
          <Input 
            icon="key-outline"
            placeholder="رمز التحقق (4 أرقام)"
            keyboardType="number-pad"
            maxLength={4}
            value={code}
            onChangeText={setCode}
          />

          <Input 
            icon="lock-closed-outline"
            placeholder="كلمة المرور الجديدة"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Button 
            title="حفظ كلمة المرور"
            onPress={handleReset}
            loading={loading}
            disabled={!code || !newPassword}
            style={{ marginTop: 12 }}
          />
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
  title: { fontSize: 32, fontWeight: '900', color: Colors.text, marginBottom: 12 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, fontWeight: '500', lineHeight: 24 },
  form: { gap: 0 },
});
