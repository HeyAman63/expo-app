import { View, Text } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import "../global.css"

const SafeScreen = ({children}:{children:React.ReactNode}) => {
    const insets = useSafeAreaInsets();
  return (
    <View className='flex-1 bg-background' style={{paddingTop:insets.top}}>
      {children}
    </View>
  )
}

export default SafeScreen