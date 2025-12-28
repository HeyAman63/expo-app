import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import useSocialAuth from '@/hooks/useSocialAuth'


const AuthScreen = () => {
  const {handleSocialAuth,isLoading}=useSocialAuth();
  return (
    <View className='flex-1 px-8 justify-center items-center bg-white'>
      {/* demoImage */}
      <Image 
      source={require('../../assets/images/auth-image.png')}
      className='size-96'
      resizeMode='contain'
      />
      <View className='gap-2 mt-4'>
        {/* Google signin button */}
        <TouchableOpacity
          className='flex flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6'
          onPress={()=>handleSocialAuth("oauth_google")}
          disabled={isLoading}
          style={{
            shadowOffset:{width:0,height:1},
            shadowOpacity:0.1,
            elevation:2 // this is for android 
          }}
        >
          {isLoading?(
            <ActivityIndicator size={"small"} color={"#4285f4"}/>
          ):(
            <View className='flex-row items-center justify-center px-5 py-2'>
              <Image source={require("../../assets/images/google.png")} className='size-10 mr-3' resizeMode='contain'/>
              <Text className='font-medium text-black text-base'>Continue With Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Apple signin button */}
        <TouchableOpacity
          className='flex flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6'
          onPress={()=>handleSocialAuth("oauth_apple")}
          disabled={isLoading}
          style={{
            shadowOffset:{width:0,height:1},
            shadowOpacity:0.1,
            elevation:2 // this is for android 
          }}
        >
          {isLoading?(
            <ActivityIndicator size={"small"} color={"#4285f4"}/>
          ):(
            <View className='flex-row items-center justify-center px-5 py-2'>
              <Image source={require("../../assets/images/apple.png")} className='size-9 mr-3' resizeMode='contain'/>
              <Text className='font-medium text-black text-base'>Continue With Apple</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Text className='text-center -text-gray-500 text-xs leading-4 mt-6 px-2'>
          By Signing out You agree to our <Text className='text-blue-500 '>Terms</Text>, <Text className='text-blue-500 '>Privacy Policy</Text>, and 
          <Text className='text-blue-500 '> cookies Use</Text>
      </Text>
    </View>
  )
}

export default AuthScreen