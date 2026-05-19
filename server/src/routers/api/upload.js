import { Router } from 'express';
import {
  upload,
  uploadProductImage,
} from '../../controllers/upload.controller.js';
import { protect, adminOnly } from '../../middleware/authentication.js';

const router = Router();

router.post('/', protect, adminOnly, upload.array('images', 10), uploadProductImage);

export default router;
