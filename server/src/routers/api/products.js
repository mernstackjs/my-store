import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getTopProducts,
} from '../../controllers/products.controller.js';
import { protect, adminOnly } from '../../middleware/authentication.js';

const router = Router();

router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, createReview);

export default router;
