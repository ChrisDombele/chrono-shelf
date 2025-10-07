import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

function RootLayoutNav() {
  const { session } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="watch/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="pages" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={session === null}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar
            style={'dark'}
            translucent={true}
            backgroundColor={'#121824'}
          />
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaProvider>
    </>
  );
}
