import { Stack } from 'expo-router';

export default function ExecutorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="kyc-submit" />
      <Stack.Screen name="kyc-status" />
    </Stack>
  );
}
