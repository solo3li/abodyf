import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#2a2a4e' },
      tabBarActiveTintColor: '#6c63ff',
      tabBarInactiveTintColor: '#6c6c90',
    }}>
      <Tabs.Screen name="services" options={{ title: 'طلبات الخدمات', tabBarIcon: ({color}) => <Ionicons name="albums" size={24} color={color} /> }} />
      <Tabs.Screen name="chats" options={{ title: 'رقابة المحادثات', tabBarIcon: ({color}) => <Ionicons name="chatbubbles" size={24} color={color} /> }} />
      <Tabs.Screen name="executors" options={{ title: 'إدارة المنفذين', tabBarIcon: ({color}) => <Ionicons name="people" size={24} color={color} /> }} />
      <Tabs.Screen name="Notifications" options={{ href: null }} />
    </Tabs>
  );
}
