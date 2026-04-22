import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSession } from '@/lib/session';

export default function LoginScreen() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.includes('@') && password.length >= 8, [email, password]);

  async function onSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      router.replace('/(drawer)/home');
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>CineVault</Text>
      <Text style={styles.subtitle}>A Netflix-style showcase app</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#667085"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Minimum 8 characters"
          placeholderTextColor="#667085"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit || submitting}
          style={({ pressed }) => [
            styles.button,
            (!canSubmit || submitting) && styles.buttonDisabled,
            pressed && canSubmit && !submitting ? styles.buttonPressed : null,
          ]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
        </Pressable>

        <Text style={styles.footer}>
          New here?{' '}
          <Link href="/(auth)/signup" style={styles.link}>
            Create an account
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050507',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#A4A7AE',
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0D0E12',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1B1E29',
  },
  label: {
    color: '#C7CAD1',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0A0B10',
    borderWidth: 1,
    borderColor: '#222638',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
  },
  error: {
    color: '#FF5A5F',
    marginTop: 10,
    fontWeight: '600',
  },
  button: {
    marginTop: 14,
    backgroundColor: '#E50914',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    marginTop: 14,
    color: '#A4A7AE',
    textAlign: 'center',
  },
  link: {
    color: '#fff',
    fontWeight: '800',
  },
});

