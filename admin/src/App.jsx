import React from 'react'
import { useAuth } from '@clerk/clerk-react'
import {Navigate, Route, Routes} from 'react-router'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProductsPage from './pages/ProductsPage'
import OrderPage from './pages/OrderPage'
import CustomersPage from './pages/CustomersPage'
import DashboardLayout from './layout/DashboardLayout'
import Pageloader from './components/Pageloader'

const App = () => {

  const {isSignedIn,isLoaded} = useAuth();

  if(!isLoaded){
    return (
      <Pageloader/>
    )
  };
  return (
    <Routes>
      <Route path='/login' element={isSignedIn? <Navigate to={"/dashboard"}/>:<LoginPage/>}/>
      <Route path='/' element={isSignedIn? <DashboardLayout/>: <Navigate to={"/login"}/>}>
        <Route index element={<Navigate to={"dashboard"}/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='products' element={<ProductsPage/>}/>
        <Route path='orders' element={<OrderPage/>}/>
        <Route path='customers' element={<CustomersPage/>}/>
      </Route>
    </Routes>
  )
}

export default App