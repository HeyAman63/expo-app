import { View, Text,Alert } from 'react-native'
import { useSSO } from '@clerk/clerk-expo'
import {useState} from 'react'

const useSocialAuth = () => {
    const [loadingStrategy, setLoadingStrategy] = useState<String | null>(null);
    const {startSSOFlow} = useSSO();
    const handleSocialAuth = async(strategy:"oauth_google" | "oauth_apple")=>{

        setLoadingStrategy(strategy);
        try {
            const {createdSessionId,setActive} = await startSSOFlow({strategy});
            if(createdSessionId && setActive){
                await setActive({session:createdSessionId});
            }
        } catch (error) {
            console.log("Error in socialAuth hook",error);
            const provider = strategy == "oauth_apple" ?"Apple" : "Google"
            Alert.alert("Error",`Failed to signin with ${provider}. please try Again`)
        }finally{
            setLoadingStrategy(null);
        }
    }
  return {loadingStrategy, handleSocialAuth}
}

export default useSocialAuth