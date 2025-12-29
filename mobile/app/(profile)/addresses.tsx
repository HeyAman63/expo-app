import { View, Text, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, { useState } from 'react'
import SafeScreen from '@/component/safeScreen'
import useAddresses from '@/hooks/useAddresses'
import { Ionicons } from '@expo/vector-icons'
import AddressesHeader from '@/component/AddressesHeader'
import { Address } from '@/types'
import AddressFromModal from '@/component/AddressFromModal'
import AddressCard from '@/component/AddressCard'

const AddressScreen = () => {

  const {addAddress,addresses,deleteAddress,isAddingAddress,isDeletingAddress,isError,isLoading,isUpdatingAddress,updateAddress}=useAddresses();

  const [showAddressForm,setShowAddressFrom] = useState(false);
  const [editingAddressID,setEditingAddressId] = useState<string | null >(null);
  const [addressForm,setAddressForm] = useState({
    label: "",
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    pinCode: "",
    phoneNumber: "",
    isDefault: false,
  });

  const handleAddAddress=async()=>{
    setShowAddressFrom(true);
    setEditingAddressId(null);
    setAddressForm({
      label: "",
      fullName: "",
      streetAddress: "",
      city: "",
      state: "",
      pinCode: "",
      phoneNumber: "",
      isDefault: false,
    });
  };
  const handleEditAddress=(address:Address)=>{
    setShowAddressFrom(true);
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      pinCode: address.pinCode,
      phoneNumber: address.phoneNumber,
      isDefault: address.isDefault,
    });
  }
  const handleDeleteAddress=(addressId:string,label:string)=>{
    Alert.alert("Delete Address",`are you sure want to delete ${label} address ?`,[
      {text:"Cancel",style:"cancel"},
      {text:"Delete",style:"destructive",
        onPress:()=>{
          deleteAddress(addressId);
        }
      },
    ])
  }
  const handleSaveAddress=async()=>{
    if(
      !addressForm.label ||
      !addressForm.fullName ||
      !addressForm.streetAddress ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pinCode ||
      !addressForm.phoneNumber||
      !addressForm.isDefault
    ){
      Alert.alert("Failed","Please fill all the fields");
      return;
    }
    
    if(editingAddressID){
      // check if editing the existing address
      updateAddress({addressId:editingAddressID,addressData:addressForm},
        {
          onSuccess:()=>{
            setShowAddressFrom(false);
            setEditingAddressId(null);
            Alert.alert("Success","Address Updated Successfully")
          },
          onError:(error:any)=>{
            Alert.alert("Error",error.response.data.error || "Failed to Update Address");
          }
        }
      )
    }else{
      // create a new address
      console.log("creating address..... frontend");
      
      addAddress(addressForm,{
        onSuccess:()=>{
          setShowAddressFrom(false);
          Alert.alert("Success","Address Added Successfully");
        },
        onError:(error:any)=>{
            Alert.alert("Error",error.response.data.error || "Failed to Add Address");
          }
      });
    }
  }
  const handleCloseAddressFrom=()=>{
    setShowAddressFrom(false);
    setEditingAddressId(null);
  }


  if(isLoading) return <LoadingUI/>;
  if(isError) return <ErrorUI/>;
  return (
    <SafeScreen>
      <AddressesHeader/>
      {addresses.length ===0?(
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="location-outline" size={80} color="#666" />
          <Text className="text-text-primary font-semibold text-xl mt-4">No addresses yet</Text>
          <Text className="text-text-secondary text-center mt-2">
            Add your first delivery address
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-2xl px-8 py-4 mt-6"
            activeOpacity={0.8}
            onPress={handleAddAddress}
          >
            <Text className="text-background font-bold text-base">Add Address</Text>
          </TouchableOpacity>
        </View>
      ):(
        <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom:100}}
        >
          <View className='px-6 py-4'>
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                isUpdatingAddress={isUpdatingAddress}
                isDeletingAddress={isDeletingAddress}
              />
            ))}

            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center mt-2"
              activeOpacity={0.8}
              onPress={handleAddAddress}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle-outline" size={24} color="#121212" />
                <Text className="text-background font-bold text-base ml-2">Add New Address</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      <AddressFromModal
        visible={showAddressForm}
        isEditing={!!editingAddressID}
        addressForm={addressForm}
        isAddingAddress={isAddingAddress}
        isUpdatingAddress={isUpdatingAddress}
        onClose={handleCloseAddressFrom}
        onSave={handleSaveAddress}
        onFormChange={setAddressForm}
      />
    </SafeScreen>
  )
}

export default AddressScreen;


function ErrorUI() {
  return (
    <SafeScreen>
      <AddressesHeader />
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Failed to load addresses
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Please check your connection and try again
        </Text>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <AddressesHeader />
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text className="text-text-secondary mt-4">Loading addresses...</Text>
      </View>
    </SafeScreen>
  );
}