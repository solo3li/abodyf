import { Stack } from 'expo-router';

export default function SharedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="support/tickets" />
      <Stack.Screen name="support/new-ticket" />
      <Stack.Screen name="support/ticket/[id]" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
