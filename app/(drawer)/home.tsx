import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import { MoviePoster } from '@/components/movie-poster';
import { getHomeRows } from '@/lib/movies';
import type { HomeRows, MovieSummary } from '@/lib/types';

function Row({ title, items }: { title: string; items: MovieSummary[] | undefined }) {
  const data = useMemo(() => items ?? [], [items]);
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <MoviePoster
            title={item.title}
            posterUrl={item.posterUrl}
            onPress={() => router.push(`/(drawer)/movie/${item.id}`)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowList}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<HomeRows | null>(null);

  const heroScale = useSharedValue(0.98);
  const heroAnim = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  async function load({ refresh = false } = {}) {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getHomeRows({ useCache: !refresh });
      setRows(data);
      heroScale.value = withTiming(1, { duration: 420 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hero = rows?.trending?.[0];

  return (
    <View style={styles.root}>
      {loading && !rows ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loadingText}>Loading</Text>
        </View>
      ) : (
        <FlatList
          data={[{ key: 'rows' }]}
          keyExtractor={(it) => it.key}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} />}
          renderItem={() => (
            <View>
              {hero ? (
                <Animated.View entering={FadeIn.duration(350)} style={[styles.heroCard, heroAnim]}>
                  <Image
                    source={hero.backdropUrl ? { uri: hero.backdropUrl } : undefined}
                    style={styles.heroImage}
                    contentFit="cover"
                  />
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroText}>
                    <Text numberOfLines={1} style={styles.heroTitle}>
                      {hero.title}
                    </Text>
                    <Text numberOfLines={3} style={styles.heroOverview}>
                      {hero.overview}
                    </Text>
                    <Text style={styles.heroHint}>Tap a poster below for details</Text>
                  </View>
                </Animated.View>
              ) : null}

              <Row title="Trending this week" items={rows?.trending} />
              <Row title="Now playing" items={rows?.nowPlaying} />
              <Row title="Top rated" items={rows?.topRated} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050507',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#A4A7AE',
    fontWeight: '700',
  },
  heroCard: {
    marginTop: 14,
    marginHorizontal: 14,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1B1E29',
    backgroundColor: '#0D0E12',
  },
  heroImage: {
    width: '100%',
    height: 230,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroText: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  heroOverview: {
    marginTop: 6,
    color: '#E0E2E6',
    fontWeight: '600',
    lineHeight: 18,
  },
  heroHint: {
    marginTop: 10,
    color: '#A4A7AE',
    fontWeight: '700',
  },
  row: {
    marginTop: 16,
  },
  rowTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginHorizontal: 14,
    marginBottom: 10,
  },
  rowList: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
});

