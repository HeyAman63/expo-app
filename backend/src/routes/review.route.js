import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createReview, deleteReviewById } from "../controller/review.controller.js";

const router = Router();
router.use(protectRoute);

router.post('/',createReview);

// we can not implement this in the mobile app -- in the frontend 
router.delete('/:reviewId',deleteReviewById);
export default router;