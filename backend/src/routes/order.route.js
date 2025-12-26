import {Router} from 'express';
import {protectRoute} from '../middlewares/auth.middleware.js'
import { createOrder, getUsersOrder } from '../controller/order.controller.js';
const router = Router();

router.use(protectRoute);

router.post('/',createOrder);
router.get('/',getUsersOrder);
export default router;