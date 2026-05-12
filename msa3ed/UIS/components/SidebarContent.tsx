import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function SidebarContent(props: any) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: user?.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User') }} 
          style={styles.avatar} 
        />
        <Text style={styles.userName}>{user?.fullName || 'مستخدم'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.divider} />

      <DrawerItemList {...props} />

      <View style={styles.footer}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { padding: 24, paddingTop: 40, backgroundColor: Colors.primary + '10' },
  avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12 },
  userName: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  userEmail: { fontSize: 14, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  footer: { marginTop: 'auto', padding: 24, borderTopWidth: 1, borderTopColor: Colors.border },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutText: { fontSize: 16, fontWeight: '600', color: Colors.error },
});
