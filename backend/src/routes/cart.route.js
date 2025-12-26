import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { addToCart, clearCart, getCart, removeFromCart, updateCratItem } from "../controller/cart.controller.js";

const router = Router();

router.use(protectRoute);

router.get('/',getCart);
router.post('/',addToCart);
router.put('/:productId',updateCratItem);
router.delete('/:productId',removeFromCart);
router.delete('/',clearCart);

export default router;