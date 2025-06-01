import { Request, Response, NextFunction } from "express";
import { CustomError } from '../../middleware/error';
import { User } from "../../models/userModel";
import Project from "../../models/projectModel";
import Task from "../../models/taskModel";

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await User.find({});
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        next(new CustomError((error as Error).message, 400));
    }
};

export const getUsersByProjectId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { projectId } = req.params;

        // Find users where the projectId is present in their 'projects' array
        const users = await User.find({ projects: projectId });


        if (!users || users.length === 0) {
            return next(new CustomError('No users found for this project', 404));
        }

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        next(new CustomError((error as Error).message, 400));
    }
};

export const assignUserToProject = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, projectId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            console.log("user not found");
            return next(new CustomError('User not found', 404));
        }

        const project = await Project.findById(projectId);
        if (!project) {
            console.log("project not found");
            return next(new CustomError('Project not found', 404));
        }

        // Add user to project's members if not already present
        if (!project.members.includes(userId)) {
            project.members.push(userId);
            await project.save();
        }

        // Add project to user's projects if not already present
        if (!user.projects.includes(projectId)) {
            user.projects.push(projectId);
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'User assigned to project successfully',
        });
    } catch (error) {
        next(new CustomError((error as Error).message, 400));
    }
};

export const assignUserToTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { taskId, userId } = req.body;
        console.log(req.body, "here is body arequst");

        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError('User not found', 404));
        }

        console.log(user);

        const task = await Task.findById(taskId);
        if (!task) {
            return next(new CustomError('Task not found', 404));
        }

        // Assign user to task
        task.assignedTo = userId;
        await task.save();

        res.status(200).json({
            success: true,
            message: 'User assigned to task successfully',
        });
    } catch (error) {
        next(new CustomError((error as Error).message, 400));
    }
};