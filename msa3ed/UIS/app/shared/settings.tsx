import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات التطبيق</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>الإشعارات</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.textSecondary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>الوضع الليلي</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
              thumbColor={darkModeEnabled ? Colors.primary : Colors.textSecondary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>اللغة</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems:'center'}}>
              <Text style={{color: Colors.primary, fontWeight: 'bold', marginLeft: 8}}>العربية</Text>
              <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الحساب</Text>
          
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>تغيير كلمة المرور</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </Pressable>

          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>الخصوصية والأمان</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عن التطبيق</Text>
          
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>الشروط والأحكام</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </Pressable>

          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.settingLabel}>نسخة التطبيق (v1.0.0)</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.white, boxShadow: [{ color: 'rgba(0, 0, 0, 0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }], elevation: 2, zIndex: 10 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  content: { padding: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16, textAlign: 'right' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, padding: 16, borderRadius: 16, marginBottom: 12, boxShadow: [{ color: 'rgba(0, 0, 0, 0.02)', offsetX: 0, offsetY: 2, blurRadius: 5, spreadDistance: 0 }], elevation: 1 },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '600', color: Colors.text, marginLeft: 12 },
});
