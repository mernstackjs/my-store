import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '../../controllers/order.controller.js';
import { protect, adminOnly } from '../../middleware/authentication.js';

const router = Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/', protect, adminOnly, getOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/payment-status', protect, adminOnly, updatePaymentStatus);

export default router;
