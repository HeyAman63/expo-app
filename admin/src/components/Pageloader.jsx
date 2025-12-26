import { LoaderIcon } from 'lucide-react'
import React from 'react'

const Pageloader = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
        <LoaderIcon className="size-12 animate-spin"/>
    </div>
  )
}

export default Pageloader