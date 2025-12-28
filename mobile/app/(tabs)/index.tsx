import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native'
import React, { useMemo, useState } from 'react'
import SafeScreen from '@/component/safeScreen'
import { Ionicons } from '@expo/vector-icons'
import ProductsGrid from '@/component/ProductsGrid';
import useProducts from '@/hooks/useProducts';


const CATEGORIES = [
  { name: "All", icon: "grid-outline" as const },
  { name: "Electronics", image: require("@/assets/images/electronics.png") },
  { name: "Fashion", image: require("@/assets/images/fashion.png") },
  { name: "Sports", image: require("@/assets/images/sports.png") },
  { name: "Books", image: require("@/assets/images/books.png") },
];

const ShopeScreen = () => {
  const [searchQuery,setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const {data:products,isLoading,isError}=useProducts();
  const filteredProducts = useMemo(()=>{
    if(!products){
      return []
    }
    let filtered = products;
    // filter by category
    if(selectedCategory !== "All"){
      filtered = filtered.filter(product=>product.category === selectedCategory)
    }
    // filter by Search query

    if(searchQuery.trim()){
      filtered = filtered.filter(product=>product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    
    return filtered
  },[products,selectedCategory,searchQuery])
  
  
  return (
    <SafeScreen>
      <ScrollView
      className='flex-1'
      contentContainerStyle={{paddingBottom:100}}
      showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className='px-6 pb-4 pt-6'>
          <View className='flex-row items-center justify-between'>
            <View>
              <Text className='text-text-primary text-3xl font-bold tracking-tight'>Shop</Text>
              <Text className='text-text-secondary text-sm mt-1'>Browse all Products</Text>
            </View>
            <TouchableOpacity className='bg-surface/50 p-3 rounded-full' activeOpacity={.6}>
              <Ionicons name='options-outline' size={22} color={"#fff"}/>
            </TouchableOpacity>
          </View>
          {/* Search bar component */}
          <View className='bg-surface flex-row items-center mt-4 px-5 py-4 rounded-2xl'>
            <Ionicons name='search-outline' color={"#fff"} size={18}/>
            <TextInput 
            placeholder='Search for Product'
            placeholderTextColor={"#666"}
            className='flex-1 h-10 p-0 pl-7 text-base text-text-primary'
            value={searchQuery}
            onChangeText={setSearchQuery}
            />
          </View>
        </View>
        {/* Category  filter */}
        <View className='mb-6 '>
          <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal:20}}
          >
            {CATEGORIES.map(category =>{
              const isSelected = selectedCategory==category.name || "";
              return(
                <TouchableOpacity 
                className={`mr-3 rounded-2xl size-20 overflow-hidden items-center justify-center ${isSelected?"bg-primary":"bg-surface"}`} 
                key={category.name} 
                onPress={()=>setSelectedCategory(category.name)}
                >
                  {category.icon?(
                    <Ionicons name={category.icon} size={36} color={isSelected?"#121212":"#fff"}/>
                  ):(
                    <Image source={category.image} className='size-12' resizeMode='contain'/>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className='px-6 pb-6'>
            <View className='flex-row items-center justify-between mb-4'>
              <Text className='text-text-primary text-lg font-bold'>Products</Text>
              <Text className='text-text-secondary text-sm'>{filteredProducts.length || 0 }+ Items</Text>
            </View>
            
            {/* products grid */}
            <ProductsGrid isLoading={isLoading} products={filteredProducts} isError={isError} />
        </View>
      </ScrollView>
    </SafeScreen>
  )
}

export default ShopeScreen