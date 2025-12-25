import cloudinary from '../config/cloudinary.js';
import {Product} from '../models/product.model.js'
import {Order} from '../models/order.model.js'
import { User } from '../models/user.model.js';


export  const createProduct =async (req,res)=>{
    const {name, description , price, stock, category} = req.body;

    try {
        if(!name || !description || !price || !stock || !category){
            return res.status(400).json({message:"all field are required"});
        }

        if(!req.files || req.files.length===0){
            return res.status(400).json({message:"Atleast one image are required"});
        }

        if(req.files.length>3){
            return res.status(400).json({message:"maximum 3 image are allowed"});
        }

        const uploadPromises = req.files.map((file)=>{
            return cloudinary.uploader.upload(file.path,{
                folder:"Products"
            });
        });

        const uploadResults = await Promise.all(uploadPromises);
        // secure url 

        const imageUrls = uploadResults.map((result)=> result.secure_url);

        // create products
        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            images:imageUrls
        })

        res.status(201).json(product)
    } catch (error) {
        console.log("Error creating product",error.message);
        res.status(500).json({message:"internal server error"});
    }

    
}


export  const getAllProducts =async (req,res)=>{

    try {
        // -1 means in desc order : most recent products first
        const products = (await Product.find()).toSorted({createdAt:-1}) ;
        res.status(200).json(products);
    } catch (error) {
        console.log("error fetching products",error.message);
        res.status(500).json({message:"Internal server error"});
        
    }
}


export  const updateProduct =async (req,res)=>{
    try {
        const {id} = req.params;
        const {name, price, stock, description,category} = req.body;
        
        const product = await Product.findById(id);

        if(!product){
            return res.status(404).json({message:"Product not found"});
        }

        if(name) product.name = name;
        if(price!=undefined) product.price = parseFloat(price);
        if(description) product.description = description;
        if(stock!=undefined) product.stock = parseInt(stock);
        if(category) product.category = category;

        // handle image upload if ne image is uploaded

        if(req.files && req.files.length > 0){
            if(req.files.length>3) {
                return res.status(400).json({message:"maximum 3 images are allowed"})
            }

            const uploadPromises = req.files.map((file)=>{
                return cloudinary.uploader.upload(file.path,{
                    folder:"Products"
                });
            });

            const uploadResults = await Promise.all(uploadPromises);
            product.images = uploadResults.map((result)=>result.secure_url);
        }

        await product.save();
        res.status(200).json(product);
    } catch (error) {
        console.log("error fetching products",error.message);
        res.status(500).json({message:"Internal server error"});
        
    }
}

export const getAllOrders = async(req,res)=>{
    try {
        const order = await Order.find().populate("user","name email").populate("orderItems.product");
        res.status(200).json({order});
    } catch (error) {
        console.log("Errors in get all products controllers");
        res.status(500).json({error:"Internal server error"});
    }
}
export const updateOrderStatus = async(req,res)=>{
    try {
        const {orderId} = req.params;
        const {status} = req.body;
        if(!["pending","shiped","delivered"].includes(status)){
            res.status(400).json({error:"invalid status"});
        }

        const order = await Order.findById(orderId);
        if(!order){
            return res.status(404).json({error:"Order not found"});
        }

        order.status = status;
        if(order.status == "shipped" && !order.shipedAt){
            order.shipedAt=new Date();
        }
        if(order.status == "delivered" && !order.deliveredAt){
            order.deliveredAt=new Date();
        }
        order.save();
        res.status(200).json({message:"Order status created successfully",order});
    } catch (error) {
        console.error("Error in updateOrderStatus controller",error.message);
        res.status(500).json({error:"Internal server error"});
        
    }
}

export const getAllCustomers = async(req,res)=>{
    try {
        const customers = await User.find().sort({createdAt:-1}); // latest user first
        res.status(200).json({customers});
    } catch (error) {
        console.error("Error fetching customers controller",error.message);
        res.status(500).json({error:"Internal server error"})
        
    }
    
}
export const getDashboardStats = async(req,res)=>{
    try {
        const totalOrders=await Order.countDocuments();
        const revenueResult = await Order.aggregate([
            {
                $group:{
                    _id:null,
                    total:{$sum: "$totalPrice"},
                },
            },
        ]);

        const totalRevenue = revenueResult[0]?.total || 0 ;
        const totalCustomers  = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            totalRevenue,
            totalCustomers,
            totalProducts,
            totalOrders
        })
    } catch (error) {
        console.error("error getting total stats in controller ",error.message);
        res.status(500).json({error:"internal server error"});
        
    }
}