import express from 'express';
import {
  getAllUsers,
  getAdminStats,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../Middleware/jwtAuth.js';
import { authorize } from '../Middleware/roleGuard.js';

const router = express.Router();

// All routes here require JWT authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
