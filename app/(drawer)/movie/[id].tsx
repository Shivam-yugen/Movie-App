import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/lib/api';
import { getMovieDetails } from '@/lib/movies';
import type { MovieDetails } from '@/lib/types';

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const tmdbId = Number(Array.isArray(id) ? id[0] : id);

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const year = useMemo(() => movie?.releaseDate?.slice?.(0, 4) ?? '', [movie]);

  useEffect(() => {
    setLoading(true);
    getMovieDetails(tmdbId)
      .then((m) => setMovie(m))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  async function onTrailer() {
    if (!movie?.trailerKey) return;
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${movie.trailerKey}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  }

  async function onToggleMyList() {
    if (!movie || saving) return;
    setSaving(true);
    try {
      if (saved) {
        await api.delete(`/lists/my-list/${movie.id}`);
        setSaved(false);
      } else {
        await api.post('/lists/my-list', {
          tmdbId: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl ?? null,
        });
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading && !movie) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.loadingText}>Loading details</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image
          source={movie?.backdropUrl ? { uri: movie.backdropUrl } : undefined}
          style={styles.backdrop}
          contentFit="cover"
          transition={220}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroTop}>
          <Text style={styles.heroTitle}>
            {movie?.title} {year ? <Text style={styles.heroYear}>({year})</Text> : null}
          </Text>
          <Text style={styles.heroMeta}>
            {movie?.runtime ? `${movie.runtime} min` : '—'} • ⭐ {movie?.voteAverage?.toFixed?.(1) ?? '—'}
          </Text>
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(240)} style={styles.actions}>
        <Pressable onPress={onTrailer} disabled={!movie?.trailerKey} style={[styles.action, !movie?.trailerKey && styles.actionDisabled]}>
          <Text style={styles.actionText}>{movie?.trailerKey ? 'Watch Trailer' : 'Trailer unavailable'}</Text>
        </Pressable>
        <Pressable onPress={onToggleMyList} disabled={saving} style={[styles.action, styles.actionSecondary, saving && styles.actionDisabled]}>
          <Text style={styles.actionText}>{saved ? 'Remove from My List' : 'Add to My List'}</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.overview}>{movie?.overview || 'No overview available.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cast</Text>
        <FlatList
          horizontal
          data={movie?.cast ?? []}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <View style={styles.castCard}>
              <View style={styles.castImageWrap}>
                <Image source={item.profileUrl ? { uri: item.profileUrl } : undefined} style={styles.castImage} contentFit="cover" />
              </View>
              <Text numberOfLines={1} style={styles.castName}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={styles.castRole}>
                {item.character}
              </Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More like this</Text>
        <FlatList
          horizontal
          data={movie?.recommendations ?? []}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/(drawer)/movie/${item.id}`)} style={styles.recoCard}>
              <Image source={item.posterUrl ? { uri: item.posterUrl } : undefined} style={styles.recoPoster} contentFit="cover" transition={160} />
              <Text numberOfLines={1} style={styles.recoTitle}>
                {item.title}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050507' },
  content: { paddingBottom: 28 },
  loading: { flex: 1, backgroundColor: '#050507', alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#A4A7AE', fontWeight: '700' },
  hero: { height: 260, marginBottom: 12 },
  backdrop: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroTop: { position: 'absolute', left: 14, right: 14, bottom: 16 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  heroYear: { color: '#C7CAD1', fontSize: 18, fontWeight: '800' },
  heroMeta: { marginTop: 6, color: '#E0E2E6', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 14 },
  action: { flex: 1, backgroundColor: '#E50914', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  actionSecondary: { backgroundColor: '#11131A', borderWidth: 1, borderColor: '#1C2030' },
  actionDisabled: { opacity: 0.55 },
  actionText: { color: '#fff', fontWeight: '900' },
  section: { marginTop: 18 },
  sectionTitle: { marginHorizontal: 14, marginBottom: 10, color: '#fff', fontSize: 16, fontWeight: '900' },
  overview: { marginHorizontal: 14, color: '#C7CAD1', lineHeight: 19, fontWeight: '600' },
  castCard: { width: 108, marginRight: 12 },
  castImageWrap: { aspectRatio: 2 / 3, borderRadius: 14, overflow: 'hidden', backgroundColor: '#11131A', borderWidth: 1, borderColor: '#1C2030' },
  castImage: { width: '100%', height: '100%' },
  castName: { marginTop: 8, color: '#E7E8EA', fontWeight: '800' },
  castRole: { marginTop: 2, color: '#A4A7AE', fontWeight: '700', fontSize: 12 },
  recoCard: { width: 120, marginRight: 12 },
  recoPoster: { width: '100%', aspectRatio: 2 / 3, borderRadius: 14, backgroundColor: '#11131A', borderWidth: 1, borderColor: '#1C2030' },
  recoTitle: { marginTop: 8, color: '#E7E8EA', fontSize: 12, fontWeight: '800' },
});

