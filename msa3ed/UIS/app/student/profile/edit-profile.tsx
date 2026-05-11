import { View, Text, StyleSheet, Pressable, Image, TextInput, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateProfile, updateProfilePicture, deleteProfilePicture } from '../../../store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { API_BASE_URL } from '../../../services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [major, setMajor] = useState(user?.major || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const getProfileImage = () => {
    if (user?.profilePicture) {
      return user.profilePicture.startsWith('http') ? user.profilePicture : API_BASE_URL + user.profilePicture;
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=random&size=200';
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج لإذن الوصول للمعرض لتغيير الصورة');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileInfo = {
        uri: manipResult.uri,
        name: 'profile_' + user?.id + '.jpg',
        type: 'image/jpeg',
      };

      const action = await dispatch(updateProfilePicture(fileInfo));
      if (updateProfilePicture.rejected.match(action)) {
        Alert.alert('خطأ', 'فشل تحميل الصورة');
      }
    }
  };

  const handleDeleteImage = () => {
    Alert.alert(
      'حذف الصورة',
      'هل أنت متأكد من رغبتك في حذف صورة الملف الشخصي؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => dispatch(deleteProfilePicture()) 
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!fullName.trim() || !university.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء الاسم والجامعة على الأقل');
      return;
    }

    setIsSaving(true);
    const result = await dispatch(updateProfile({ fullName, university, major, bio }));
    setIsSaving(false);

    if (updateProfile.fulfilled.match(result)) {
      Alert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح');
      router.back();
    } else {
      Alert.alert('خطأ', 'فشل تحديث البيانات');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-forward" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>تعديل الملف الشخصي</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: getProfileImage() }} style={styles.image} />
            <Pressable style={styles.editBadge} onPress={handlePickImage}>
              <Ionicons name="camera" size={20} color={Colors.white} />
            </Pressable>
          </View>
          {user?.profilePicture && (
            <Pressable onPress={handleDeleteImage} style={styles.removeBtn}>
              <Text style={styles.removeText}>حذف الصورة</Text>
            </Pressable>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>الاسم الكامل</Text>
          <Input 
            value={fullName}
            onChangeText={setFullName}
            placeholder="أدخل اسمك الكامل"
            icon="person-outline"
          />

          <Text style={styles.label}>الجامعة</Text>
          <Input 
            value={university}
            onChangeText={setUniversity}
            placeholder="اسم الجامعة"
            icon="school-outline"
          />

          <Text style={styles.label}>التخصص</Text>
          <Input 
            value={major}
            onChangeText={setMajor}
            placeholder="مثلاً: هندسة برمجيات"
            icon="book-outline"
          />

          <Text style={styles.label}>نبذة تعريفية</Text>
          <View style={styles.bioContainer}>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="تحدث عن خبراتك ومهاراتك..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>

          <Button 
            title="حفظ التغييرات"
            onPress={handleSave}
            loading={isSaving}
            style={{ marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 24, paddingBottom: 60 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 32,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  imageSection: { alignItems: 'center', marginBottom: 32 },
  imageContainer: { width: 120, height: 120, borderRadius: 60, position: 'relative' },
  image: { width: '100%', height: '100%', borderRadius: 60, backgroundColor: Colors.background },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: { marginTop: 12 },
  removeText: { color: Colors.error, fontWeight: '600' },
  form: { gap: 8 },
  label: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4, textAlign: 'right' },
  bioContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioInput: { 
    textAlign: 'right', 
    fontSize: 16, 
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: { textAlign: 'left', fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
});
