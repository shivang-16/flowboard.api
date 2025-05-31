import express from 'express';
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByProjectId,
} from '../controllers/Task';
import { checkAuth } from '../middleware/checkAuth';

const router = express.Router();

router.route('/').post(checkAuth, createTask).get(checkAuth, getTasks);
router.route('/:id').get(checkAuth, getTaskById).put(checkAuth, updateTask).delete(checkAuth, deleteTask);
router.get('/project/:projectId', checkAuth, getTasksByProjectId);

export default router;