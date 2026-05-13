import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../context/AuthContext';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { API_BASE_URL } from '../../../services/api';

const getApiUrl = (path?: string) => {
  if (!path) return null;
  return path.startsWith('http') ? path : API_BASE_URL + path;
};

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAuth();
  
  const avatarUrl = getApiUrl(user?.profilePicture) || 
    ('https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || user?.fullName || 'User') + '&background=random&size=200');

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.profilePanel}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatar} 
        />
        <Text style={styles.userName}>{user?.fullName || user?.name || 'مستخدم'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        
        {user?.isExecutor && (
          <View style={styles.executorBadge}>
            <Text style={styles.executorText}>منفذ</Text>
          </View>
        )}
      </View>
      <View style={styles.drawerItemsContainer}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { user } = useAuth();
  const isExecutor = user?.isExecutor || false;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerStyle: {
          backgroundColor: Colors.surface,
          width: 280,
        },
        drawerLabelStyle: {
          fontWeight: '600',
          fontSize: 15,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'الرئيسية',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="inbox"
        options={{
          title: 'الوارد',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="favourites"
        options={{
          title: 'المفضلة',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="categories"
        options={{
          title: 'الأقسام',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* EXECUTOR ONLY */}
      <Drawer.Screen
        name="executor-orders"
        options={{
          title: 'متاح للعمل (منفذ)',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
          drawerItemStyle: { display: isExecutor ? 'flex' : 'none' },
        }}
      />
      <Drawer.Screen
        name="executor-earnings"
        options={{
          title: 'أرباحي (منفذ)',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
          drawerItemStyle: { display: isExecutor ? 'flex' : 'none' },
        }}
      />

      <Drawer.Screen
        name="wallet/index"
        options={{
          title: 'المحفظة',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  profilePanel: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userName: {
    color: Colors.surface,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'left',
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'left',
  },
  executorBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  executorText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  drawerItemsContainer: {
    paddingHorizontal: 8,
  }
});
