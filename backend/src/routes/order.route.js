import {Router} from 'express';
import {protectRoute} from '../middlewares/auth.middleware.js'
const router = Router();

router.use(protectRoute);

router.post('/',createOrder);
router.get('/',getUsersOrder);
export default router;