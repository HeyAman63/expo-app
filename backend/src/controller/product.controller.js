import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

export const getProductById = async(req,res)=>{
    try {
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"Invalid product id"});
        }
        const product =  await Product.findById(id);
        if(!product){
            return res.status(400).json({message:"Product is not found"});
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("error in the getProductbyId controller",error.message);
        res.status(500).json({message:"internal server error"});
    }
}