import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function SidebarContent(props: any) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Modern Background */}
      <LinearGradient
        colors={[Colors.primary + '10', Colors.white]}
        style={StyleSheet.absoluteFill}
      />
      
      <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image 
            source={{ uri: user?.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User') }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.userName}>{user?.fullName || 'مستخدم'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Professional Badge for Executors */}
        {user?.isExecutor && (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proBadge}
          >
            <View style={styles.badgeItem}>
              <Text style={styles.badgeValue}>{user?.rating || '5.0'}</Text>
              <Text style={styles.badgeLabel}>التقييم</Text>
            </View>
            <View style={styles.badgeDivider} />
            <View style={styles.badgeItem}>
              <Text style={styles.badgeValue}>{user?.completedOrdersCount || '0'}</Text>
              <Text style={styles.badgeLabel}>طلب مكتمل</Text>
            </View>
          </LinearGradient>
        )}

        <View style={styles.divider} />

        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            </View>
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </Pressable>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: Colors.white },
  userName: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textSecondary },
  proBadge: {
    marginHorizontal: 24,
    marginTop: 8,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(99, 102, 241, 0.3)', offsetX: 0, offsetY: 8, blurRadius: 15, spreadDistance: 0 }],
    elevation: 8,
  },
  badgeItem: { alignItems: 'center' },
  badgeValue: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  badgeLabel: { color: Colors.white, fontSize: 10, opacity: 0.8 },
  badgeDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20, marginHorizontal: 24 },
  menuContainer: { paddingHorizontal: 12 },
  footer: { marginTop: 40, padding: 24, borderTopWidth: 1, borderTopColor: Colors.border },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.error + '10', justifyContent: 'center', alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '600', color: Colors.error },
});
