import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createPaymentIntent, handleWebHook } from "../controller/payment.controller.js";

const router = Router();

// Define your payment routes here  

router.post("/create-intent",protectRoute, createPaymentIntent);

// no route needed stripe validates via signature
router.post("/webhook",handleWebHook)

export default router;