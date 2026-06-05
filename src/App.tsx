import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AuthUser } from './api/authApi';
import { loadStoredAuthSession } from './state/authStore';
import { AuthScreen } from './features/auth/AuthScreen';
import { DashboardScreen } from './features/dashboard/DashboardScreen';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadStoredAuthSession()
      .then((session) => {
        if (isMounted && session?.user) {
          setUser(session.user);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color="#ff0055" />
        <Text style={{ color: '#aaa', marginTop: 12 }}>Loading Mistress-X session…</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onSuccess={setUser} />;
  }

  return <DashboardScreen onLogout={() => setUser(null)} />;
}
