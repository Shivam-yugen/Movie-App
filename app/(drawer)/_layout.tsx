import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { color: '#fff', fontWeight: '900' },
        headerStyle: { backgroundColor: '#050507' },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerLeft: () => <DrawerToggleButton tintColor="#fff" />,
        drawerStyle: { backgroundColor: '#0B0C10' },
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#A4A7AE',
      }}>
      <Drawer.Screen name="home" options={{ title: 'Home' }} />
      <Drawer.Screen name="search" options={{ title: 'Search' }} />
      <Drawer.Screen name="my-list" options={{ title: 'My List' }} />
      <Drawer.Screen name="profile" options={{ title: 'Profile' }} />
      <Drawer.Screen name="movie/[id]" options={{ title: 'Movie', drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}

