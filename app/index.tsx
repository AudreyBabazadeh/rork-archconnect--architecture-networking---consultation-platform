import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/welcome" />;
}