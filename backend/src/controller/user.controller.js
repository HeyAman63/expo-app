import mongoose from "mongoose";
import { User } from "../models/user.model.js";

export const addAddresses = async (req,res)=>{
    try {
        const {label,fullName,state,pinCode, isDefault,phoneNumber,streetAddress,city} = req.body;
        const user = req.user;
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(!label || !fullName || !state || !pinCode || !phoneNumber || !streetAddress || !city){
            return res.status(400).json({message:"all field are required"});
        }
        // if this is set as default, unset all other defaults
        if(isDefault){
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses.push({
            label:label,
            fullName,
            city,
            state,
            pinCode,
            streetAddress,
            phoneNumber,
            isDefault:isDefault || false
        })

        await user.save();

        res.status(201).json({message:"address Created successfully",address:user.addresses});
    } catch (error) {
        console.log("Error in addAddress controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const getAddresses = async (req,res)=>{
    try {
        const user = req.user;
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        res.status(200).json({addresses:user.addresses});

    } catch (error) {
        console.log("Error in getaddress controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const updateAddress = async (req,res)=>{
    try {
        const {addressId} = req.params;
        const {label,fullName,state,pinCode, isDefault,phoneNumber,streetAddress,city} = req.body;
        const user = req.user;
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(!mongoose.Types.ObjectId.isValid(addressId)){
            return res.status(400).json({message:"Invalid address ID"});
        }
        const address = user.addresses.id(addressId);
        if(!address){
            return res.status(404).json({message:"Address not found"});
        }

        // if this is set as default, unset all other defaults
        if(isDefault){
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        address.label = label || address.label;
        address.fullName = fullName || address.fullName;
        address.streetAddress = streetAddress || address.streetAddress;
        address.phoneNumber = phoneNumber || address.phoneNumber;
        address.pinCode = pinCode || address.pinCode;
        address.state = state || address.state;
        address.city = city || address.city;
        address.isDefault = isDefault !==undefined ? isDefault : address.isDefault;

        await user.save();

        res.status(200).json({message:"Address updated successfully",addresses:user.addresses})

    } catch (error) {
        console.log("Error in updateAddress controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const deleteAddress = async (req,res)=>{

    try {
        const {addressId} = req.params;
        const user = req.user;
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(!mongoose.Types.ObjectId.isValid(addressId)){
            return res.status(400).json({message:"Invalid address ID"});
        }
        user.addresses.pull(addressId);
        await user.save();
        res.status(200).json({message:"Address deleted successfully",addresses:user.addresses})
    } catch (error) {
        console.log("Error in deleteAddress controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const addToWishlist = async (req,res)=>{

    try {
        const {productId} = req.body;
        const user = req.user;

        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(!productId || !mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({message:"Invalid product ID"});
        }

        // check if the product is already in wishlist
        if(user.wishList.includes(productId)){
            return res.status(400).json({error:"Product Already in wishList"});
        }

        user.wishList.push(productId);

        await user.save();
        res.status(200).json({message:"product added to wishlist",wishlist:user.wishList})
    } catch (error) {
        console.log("Error in add to wishlist controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
    
}

export const removeFromWishlist = async (req,res)=>{
    try {
        const {productId} = req.params;
        const user = req.user;

        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({message:"Invalid Product ID"});
        }

        if(!user.wishList.includes(productId)){
            return res.status(400).json({error:"Product not even in the wishList"});
        }

        user.wishList.pull(productId);
        await user.save();
        res.status(200).json({message:"Product removed from wishlist",wishlist:user.wishList});
    } catch (error) {
        console.log("Error in removeFromeWishlist controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const getWishlist = async (req,res)=>{
    try {
        //we are using populate because wishList is an arrary of products ids
        const user = await User.findById(req.user._id).populate("wishList");


        res.status(200).json({wishList:user.wishList});
    } catch (error) {
        console.log("Error in getWishlist controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
}