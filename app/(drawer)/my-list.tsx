import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { MoviePoster } from '@/components/movie-poster';
import { api } from '@/lib/api';
import type { MyListItem } from '@/lib/types';

export default function MyListScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<MyListItem[]>([]);

  async function load({ refresh = false } = {}) {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get('/lists/my-list');
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>My List</Text>
        <Text style={styles.sub}>Saved across devices (server-side)</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          numColumns={3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} />}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MoviePoster
                width={110}
                title={item.title}
                posterUrl={item.posterUrl}
                onPress={() => router.push(`/(drawer)/movie/${item.tmdbId}`)}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Pressable style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing saved yet</Text>
              <Text style={styles.emptySub}>Open a movie and tap “Add to My List”.</Text>
            </Pressable>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050507' },
  header: { paddingTop: 16, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#141726' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  sub: { marginTop: 6, color: '#A4A7AE', fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 10, paddingTop: 14, paddingBottom: 24 },
  gridItem: { flex: 1 / 3, paddingHorizontal: 4, paddingBottom: 16 },
  empty: { paddingHorizontal: 14, paddingTop: 40 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  emptySub: { marginTop: 8, color: '#A4A7AE', lineHeight: 18, fontWeight: '600' },
});

