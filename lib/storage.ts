import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth.token';
const WEB_TOKEN_KEY = `web:${TOKEN_KEY}`;

export async function getToken() {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(WEB_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(WEB_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(WEB_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`cache:${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown) {
  await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(value));
}

