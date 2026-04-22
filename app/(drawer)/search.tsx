import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { MoviePoster } from '@/components/movie-poster';
import { searchMovies } from '@/lib/movies';
import type { MovieSummary } from '@/lib/types';

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const headerY = useRef(new Animated.Value(0)).current;
  const headerStyle = {
    transform: [
      {
        translateY: headerY.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
    opacity: headerY.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    }),
  };

  useEffect(() => {
    const t = setTimeout(() => {
      const query = q.trim();
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      searchMovies(query)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.title}>Search</Text>
        <TextInput
          value={q}
          onChangeText={(v) => {
            setQ(v);
            Animated.timing(headerY, { toValue: v.length > 0 ? 1 : 0, duration: 160, useNativeDriver: true }).start();
          }}
          placeholder="Search movies…"
          placeholderTextColor="#667085"
          autoCapitalize="none"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <Text style={styles.meta}>
          {loading ? 'Searching…' : results.length ? `${results.length} results` : 'Try “Batman”, “Interstellar”…'}
        </Text>
      </Animated.View>

      <FlatList
        data={results}
        keyExtractor={(it) => String(it.id)}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <MoviePoster
              width={110}
              title={item.title}
              posterUrl={item.posterUrl}
              onPress={() => router.push(`/(drawer)/movie/${item.id}`)}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Pressable style={styles.empty} onPress={() => Keyboard.dismiss()}>
            <Text style={styles.emptyTitle}>{q.trim() ? 'No results' : 'Search for something'}</Text>
            <Text style={styles.emptySub}>
              This screen demonstrates networking + debounce, and uses core tags like TextInput, Scroll views, and FlatList.
            </Text>
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050507' },
  header: {
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#141726',
    backgroundColor: '#050507',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  input: {
    marginTop: 12,
    backgroundColor: '#0A0B10',
    borderWidth: 1,
    borderColor: '#222638',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontWeight: '700',
  },
  meta: { marginTop: 10, color: '#A4A7AE', fontWeight: '700' },
  list: { paddingHorizontal: 10, paddingTop: 14, paddingBottom: 24 },
  gridItem: { flex: 1 / 3, paddingHorizontal: 4, paddingBottom: 16 },
  empty: { paddingHorizontal: 14, paddingTop: 40 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  emptySub: { marginTop: 8, color: '#A4A7AE', lineHeight: 18, fontWeight: '600' },
});

