import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  posterUrl?: string | null;
  onPress: () => void;
  width?: number;
};

export const MoviePoster = memo(function MoviePoster({ title, posterUrl, onPress, width = 120 }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.root, { width }]} android_ripple={{ color: '#ffffff22' }}>
      <View style={styles.posterWrap}>
        <Image
          source={posterUrl ? { uri: posterUrl } : undefined}
          placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }}
          style={styles.poster}
          contentFit="cover"
          transition={180}
        />
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  root: {
    marginRight: 12,
  },
  posterWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#1C2030',
    aspectRatio: 2 / 3,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 8,
    color: '#E7E8EA',
    fontSize: 12,
    fontWeight: '700',
  },
});

