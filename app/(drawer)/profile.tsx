import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { config } from '@/lib/config';
import { healthCheck } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function ProfileScreen() {
  const { user, logout } = useSession();
  const [health, setHealth] = useState<string | null>(null);

  useEffect(() => {
    healthCheck()
      .then((d) => setHealth(d?.ok ? 'OK' : 'Unknown'))
      .catch(() => setHealth('Offline'));
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user?.email ?? '—'}</Text>

        <View style={styles.sep} />

        <Text style={styles.label}>API Base URL</Text>
        <Text style={styles.valueSmall}>{config.apiBaseUrl}</Text>

        <Text style={styles.label}>Backend health</Text>
        <Text style={styles.valueSmall}>{health ?? 'Checking…'}</Text>

        <View style={styles.sep} />

        <Pressable
          style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}>
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Tip: when testing on a real phone, set `EXPO_PUBLIC_API_BASE_URL` to your computer’s LAN IP
        (same Wi‑Fi), e.g. `http://192.168.x.x:4000`.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050507', padding: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 6, marginBottom: 12 },
  card: { backgroundColor: '#0D0E12', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#1B1E29' },
  label: { color: '#A4A7AE', fontWeight: '800', marginTop: 10 },
  value: { marginTop: 6, color: '#fff', fontWeight: '900', fontSize: 16 },
  valueSmall: { marginTop: 6, color: '#E0E2E6', fontWeight: '700' },
  sep: { height: 1, backgroundColor: '#1B1E29', marginTop: 14 },
  button: { marginTop: 16, backgroundColor: '#E50914', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontWeight: '900' },
  hint: { marginTop: 14, color: '#A4A7AE', fontWeight: '700', lineHeight: 18 },
});

