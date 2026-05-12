import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../../context/AuthContext';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function TabLayout() {
  const { user } = useAuth();
  const isExecutor = user?.isExecutor || false;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={Colors.primary} />,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: '800', color: Colors.text, fontSize: 18 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }} />
        ),
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'المفضلة',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'الأقسام',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />
          ),
          href: null,
        }}
      />
      {/* EXECUTOR ONLY TABS - HIDDEN FROM BOTTOM BAR */}
      <Tabs.Screen
        name="executor-orders"
        options={{
          title: 'متاح للعمل',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "briefcase" : "briefcase-outline"} size={size} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="executor-earnings"
        options={{
          title: 'أرباحي',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cash" : "cash-outline"} size={size} color={color} />
          ),
          href: null,
        }}
      />
      {/* COMMON TABS */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'طلباتي',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'الوارد',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "mail" : "mail-outline"} size={size} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'الرسائل',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
