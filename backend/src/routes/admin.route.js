import { Router } from "express";
import { createProduct, getAllCustomers, getAllOrders, getAllProducts, getDashboardStats, updateOrderStatus, updateProduct } from "../controller/admin.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// optimization 
router.use(protectRoute,adminOnly);

router.post("/products", upload.array("images",3), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images",3), updateProduct);

router.get("/orders",getAllOrders);
router.patch("/orders/:orderId/status",updateOrderStatus);

// put : used for updating full resource replacement, updating the entire resource
// patch : used for partial resource updates, updating a specific part of the resource

router.get("/customers",getAllCustomers)
router.get("/stats",getDashboardStats);

export default router;