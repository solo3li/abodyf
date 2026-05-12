import { Drawer } from 'expo-router/drawer';
import { Colors } from '../../constants/Colors';
import SidebarContent from '../../components/SidebarContent';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function StudentLayout() {
  const { user } = useAuth();
  const isExecutor = user?.isExecutor || false;

  return (
    <Drawer
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerLabelStyle: { fontWeight: 'bold' },
        drawerType: 'front',
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'الرئيسية',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="(tabs)/categories"
        options={{
          title: 'الأقسام',
          drawerIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="(tabs)/favourites"
        options={{
          title: 'المفضلة',
          drawerIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="(tabs)/inbox"
        options={{
          title: 'الوارد',
          drawerIcon: ({ color, size }) => <Ionicons name="mail-outline" size={size} color={color} />,
        }}
      />

      {/* EXECUTOR CONSOLE */}
      <Drawer.Screen
        name="(tabs)/executor-orders"
        options={{
          title: 'طلبات التنفيذ',
          drawerIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
          drawerItemStyle: { display: isExecutor ? 'flex' : 'none' },
        }}
      />
      <Drawer.Screen
        name="../executor/projects/available"
        options={{
          title: 'تصفح المشاريع',
          drawerIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
          drawerItemStyle: { display: isExecutor ? 'flex' : 'none' },
        }}
      />
      <Drawer.Screen
        name="(tabs)/executor-earnings"
        options={{
          title: 'الأرباح',
          drawerIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} />,
          drawerItemStyle: { display: isExecutor ? 'flex' : 'none' },
        }}
      />

      <Drawer.Screen
        name="checkout"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="payment-result"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

