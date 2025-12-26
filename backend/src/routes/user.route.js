import { Router } from "express";
import {protectRoute} from '../middlewares/auth.middleware.js' 
import { addAddresses, addToWishlist, deleteAddress, getAddresses, getWishlist, removeFromWishlist, updateAddress } from "../controller/user.controller.js";

const router = Router();
router.use(protectRoute);


// address routes
router.post("/addresses",addAddresses);
router.get("/addresses",getAddresses);
router.put("/addresses/:addressId",updateAddress);
router.delete("/addresses/:addressId",deleteAddress);

// wishlist routes

router.post("/wishlist",addToWishlist);
router.delete("/wishlist/:productId",removeFromWishlist);
router.get("/wishlist",getWishlist);

export default router;