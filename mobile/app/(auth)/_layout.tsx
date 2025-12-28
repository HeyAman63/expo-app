import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn,userId } = useAuth();
  console.log(userId);
  console.log(isSignedIn);
  

  // if (isSignedIn) {
  //   return <Redirect href={'/auth'} />
  // }

  return <Stack screenOptions={{headerShown:false}} />
}