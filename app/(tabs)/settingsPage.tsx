import { Link } from 'expo-router';
import React from 'react';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  return (
    <SafeAreaView>
      <Link href={'/settings/accountPage'} push asChild>
        <Button type="clear" title={'Account Settings'} />
      </Link>
    </SafeAreaView>
  );
}
