// app/settings/test.tsx
import Account from '@/components/Account';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountPage() {
  const { session } = useAuth();

  return (
    <SafeAreaView>
      <Account session={session} />
    </SafeAreaView>
  );
}
