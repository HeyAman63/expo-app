import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export const createReview = async(req,res)=>{

    try {
        const {productId,orderId,rating} = req.body;
        if(!rating || rating < 1 || rating>5){
            return res.status(400).json({message:"Invalid rating by user"});
        }
        const user = req.user;
        // verify if the order exists or delevered
        const order = await Order.findById(orderId);
        if(!order){
            return res.status(404).json({message:"Order is not found"});
        }
        if(order.clerkId !== user.clerkId){
            return res.status(403).json({message:"not authorized to review this order"});
        }
        if(order.status !== "delivered"){
            return res.status(403).json({message:"can only reviewed delevered order"});
        }
        // verify product is in the order

        const productInOrder = order.find((item)=>item.product.toString() === productId.toString());
        if(!productInOrder){
            return res.status(404).json({message:"product not found in this order"});
        }

        // check if review already exist
        const existingReview = await Review.findOne({productId,userId:user._id});
        if(existingReview){
            return res.status(400).json({message:"You have already reviewed this product"});
        }

        // atomic create or update
        const review = await Review.findOneAndUpdate(
            { productId, userId: user._id },
            { rating, orderId, productId, userId: user._id },
            { new: true, upsert: true, runValidators: true }
        );

        // update the product raating
        const reviews = await Review.find({ productId });
        const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                averageRating: totalRating / reviews.length,
                totalReviews: reviews.length,
            },
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            await Review.findByIdAndDelete(review._id);
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error) {
        console.error("Error in the createreview controller");
        res.status(500).json({message:"Internal server error"});
    }
}

export const deleteReviewById = async(req,res)=>{
    try {
    const { reviewId } = req.params;

    const user = req.user;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this review" });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    await Product.findByIdAndUpdate(productId, {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
    });

    res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error in deleteReview controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}