import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../app/contexts/AuthContext';
import './global.css';

function RootLayoutNav() {
  const { session } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';

    if (!session && inAuthGroup) {
      // Redirect to sign-in if not authenticated and trying to access protected routes
      router.replace('/sign-in');
    } else if (session && !inAuthGroup) {
      // Redirect to main app if authenticated and on sign-in page
      router.replace('/(tabs)');
    }
  }, [session, segments]);

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar
            style={'dark'}
            translucent={true}
            backgroundColor={'#121824'}
          />
          <RootLayoutNav />
        </SafeAreaProvider>
      </AuthProvider>
    </>
  );
}
