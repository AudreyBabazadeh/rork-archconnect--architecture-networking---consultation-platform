import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MessagingProvider, useMessaging } from "@/contexts/MessagingContext";
import { BookingProvider } from "@/contexts/BookingContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function UserSyncComponent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setCurrentUser } = useMessaging();

  useEffect(() => {
    // Convert AuthUser to User for messaging context
    if (user) {
      const messagingUser = {
        id: user.id,
        name: user.name,
        title: user.title,
        university: user.university,
        location: user.location,
        avatar: user.avatar,
        specialties: user.specialties,
        experience: user.experience,
        hourlyRate: user.hourlyRate,
        rating: user.rating,
        reviewCount: user.reviewCount,
        bio: user.bio,
        portfolio: user.portfolio,
        isAvailable: user.isAvailable
      };
      setCurrentUser(messagingUser);
    } else {
      setCurrentUser(null);
    }
  }, [user, setCurrentUser]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="consultant/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      <Stack.Screen name="profile/status" options={{ title: "My Status" }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MessagingProvider>
          <BookingProvider>
            <UserSyncComponent>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </UserSyncComponent>
          </BookingProvider>
        </MessagingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}