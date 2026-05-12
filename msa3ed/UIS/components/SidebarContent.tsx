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

const DrawerItem = ({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]} onPress={onPress}>
    <Ionicons name={icon} size={22} color={Colors.text} style={styles.drawerItemIcon} />
    <Text style={styles.drawerItemLabel}>{label}</Text>
  </Pressable>
);

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
          <DrawerItem 
            icon="home-outline" 
            label="الرئيسية" 
            onPress={() => router.push('/student/(tabs)')} 
          />
          <DrawerItem 
            icon="grid-outline" 
            label="الأقسام" 
            onPress={() => router.push('/student/(tabs)/categories')} 
          />
          <DrawerItem 
            icon="heart-outline" 
            label="المفضلة" 
            onPress={() => router.push('/student/(tabs)/favourites')} 
          />
          <DrawerItem 
            icon="mail-outline" 
            label="الوارد" 
            onPress={() => router.push('/student/(tabs)/inbox')} 
          />

          {user?.isExecutor && (
            <>
              <View style={styles.divider} />
              <DrawerItem 
                icon="briefcase-outline" 
                label="طلبات التنفيذ" 
                onPress={() => router.push('/student/(tabs)/executor-orders')} 
              />
              <DrawerItem 
                icon="search-outline" 
                label="تصفح المشاريع" 
                onPress={() => router.push('/executor/projects/available')} 
              />
              <DrawerItem 
                icon="cash-outline" 
                label="الأرباح" 
                onPress={() => router.push('/student/(tabs)/executor-earnings')} 
              />
            </>
          )}
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
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 4 },
  drawerItemPressed: { backgroundColor: Colors.primary + '10' },
  drawerItemIcon: { marginRight: 12, width: 24, textAlign: 'center' },
  drawerItemLabel: { fontSize: 16, color: Colors.text, fontWeight: '500' },
});
