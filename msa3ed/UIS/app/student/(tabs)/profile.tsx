import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../services/api';

const { width } = Dimensions.get('window');

const getApiUrl = (path: string) => path ? (path.startsWith('http') ? path : API_BASE_URL + path) : 'https://placehold.co/150';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { icon: 'wallet', title: 'المحفظة', value: '0 ج.م', route: '' },
    { icon: 'heart', title: 'المفضلة', route: '' },
    { icon: 'settings', title: 'الإعدادات', route: '/shared/settings' },
    { icon: 'help-buoy', title: 'الدعم والنزاعات', route: '/shared/support/tickets' },
    ...(user?.isExecutor 
      ? [{ icon: 'briefcase', title: 'الطلبات المتاحة للتنفيذ', route: '/student/(tabs)/executor-orders', color: Colors.success }]
      : [{ icon: 'briefcase', title: 'العمل كمنفذ (KYC)', route: '/executor/kyc-submit', color: Colors.warning }]),
    { icon: 'log-out', title: 'تسجيل الخروج', action: handleLogout, color: Colors.error },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>حسابي</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: getApiUrl(user?.profilePicture || 'https://i.pravatar.cc/150?u=' + (user?.id || '123')) }} 
              style={styles.avatar} 
            />
            <Pressable style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </Pressable>
          </View>
          <Text style={styles.name}>{user?.name || user?.email?.split('@')[0] || 'مستخدم'}</Text>
          <Text style={styles.university}>{user?.university || 'جامعة غير محددة'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.completedOrdersCount || 0}</Text>
            <Text style={styles.statLabel}>طلب مكتمل</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.rating || '0.0'}</Text>
            <Text style={styles.statLabel}>التقييم العام</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              style={[
                styles.menuItem, 
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={() => {
                if (item.action) {
                  item.action();
                } else if (item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: (item.color || Colors.primary) + '15' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color || Colors.primary} />
                </View>
                <Text style={[styles.menuItemTitle, item.color && { color: item.color }]}>{item.title}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBackground: {
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.white,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  university: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  content: {
    padding: 24,
    paddingTop: 0,
    marginTop: -40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 8,
    boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 3,
    marginBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 12,
  },
});
