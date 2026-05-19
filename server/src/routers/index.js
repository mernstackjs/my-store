import { Router } from 'express';
import authRouter from './api/auth.js';
import productRouter from './api/products.js';
import orderRouter from './api/order.js';
import uploadRouter from './api/upload.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/upload', uploadRouter);

export default router;
