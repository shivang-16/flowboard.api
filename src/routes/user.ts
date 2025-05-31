import express from 'express';
import { assignUserToProject, assignUserToTask, getAllUsers, getUsersByProjectId } from '../controllers/User';
import { checkAuth } from '../middleware/checkAuth';

const router = express.Router();

router.route('/').get(checkAuth, getAllUsers);
router.route('/project/:projectId').get(checkAuth, getUsersByProjectId);
router.route('/assign/task').post(checkAuth, assignUserToTask);
router.route('/assign/project/:project').get(checkAuth, assignUserToProject);

export default router;