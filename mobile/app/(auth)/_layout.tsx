import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn,userId } = useAuth();
  

  // if (isSignedIn) {
  //   return <Redirect href={'/auth'} />
  // }

  return <Stack screenOptions={{headerShown:false}} />
}