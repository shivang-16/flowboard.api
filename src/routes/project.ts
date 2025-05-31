import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from '../controllers/Project';
import { checkAuth } from '../middleware/checkAuth';

const router = express.Router();

router.route('/').post(checkAuth, createProject).get(checkAuth, getProjects);
router.route('/:id').get(checkAuth, getProjectById).put(checkAuth, updateProject).delete(checkAuth, deleteProject);

export default router;