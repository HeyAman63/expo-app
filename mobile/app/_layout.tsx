import { Stack } from "expo-router";
import {ClerkProvider} from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { StripeProvider } from "@stripe/stripe-react-native";
import '../global.css';

export default function RootLayout() {
  const queryClient = new QueryClient();
  return(
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
          <Stack screenOptions={{headerShown:false}} />
        </StripeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
