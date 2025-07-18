import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../../app/lib/supabase';
import Auth from '../../components/Auth';
import Account from '../../components/Account';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View>
      {session && session.user ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <Auth />
      )}
    </View>
  );
}
