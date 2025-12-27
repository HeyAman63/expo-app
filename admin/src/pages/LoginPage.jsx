import { SignIn } from '@clerk/clerk-react'
import React from 'react'

const LoginPage = () => {
  return (
    <div className='h-screen w-full flex justify-center items-center'>
        <SignIn/>
    </div>
  )
}

export default LoginPage