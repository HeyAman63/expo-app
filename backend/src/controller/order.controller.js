import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export const createOrder = async(req,res)=>{
    try {
        const user = req.user;
        const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items" });
        }

        // validate products and stock
        for (const item of orderItems){
            const product = await Product.findById(item.product._id);
            if(!product){
                return res.status(404).json({error:`Product ${item.name} not found`});
            }
            if(product.stock<item.quantity){
                return res.status(400).json({error:`insufficient stock for ${item.name} `});
            }
        }

        const order = await Order.create({
            user: user._id,
            clerkId:user.clerkId,
            orderItems,
            shippingAddress,
            paymentResult,
            totalPrice
        })

        // update item stock
        for(const item of orderItems ){
            await Product.findByIdAndUpdate(item.product._id,{
                $inc:{stock : -item.quantity},
            });
        };
        res.status(201).json({message:"Order created successfully",order});
    } catch (error) {
        console.log("Error in create order controller",error.message);
        res.status(500).json({error:"Internal server error"})
    }
}

export const getUsersOrder = async(req,res)=>{
    try {
        const orders = await Order.find({clerkId:req.user.clerkId}).populate("orderItems.product").sort({createdAt:-1});

        // check if the each order has been reviewed
        const orderIds = orders.map((order) => order._id);
        const reviews = await Review.find({ orderId: { $in: orderIds } });
        const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

        const ordersWithReviewStatus = await Promise.all(
        orders.map(async (order) => {
            return {
            ...order.toObject(),
            hasReviewed: reviewedOrderIds.has(order._id.toString()),
            };
        })
        );

        res.status(200).json({orders:ordersWithReviewStatus});
    } catch (error) {
        console.log("Error in create order controller",error.message);
        res.status(500).json({error:"Internal server error"})
    }
}