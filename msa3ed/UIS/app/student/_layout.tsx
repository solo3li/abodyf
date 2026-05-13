import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="payment-result" />
    </Stack>
  );
}
