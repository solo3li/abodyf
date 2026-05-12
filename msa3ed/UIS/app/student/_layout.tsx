import { Drawer } from 'expo-router/drawer';
import { Colors } from '../../constants/Colors';
import SidebarContent from '../../components/SidebarContent';
import { Ionicons } from '@expo/vector-icons';

export default function StudentLayout() {
  return (
    <Drawer
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerLabelStyle: { fontWeight: 'bold' },
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
      <Drawer.Screen
        name="checkout"
        options={{
          drawerItemStyle: { display: 'none' }, // Hide from drawer
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
