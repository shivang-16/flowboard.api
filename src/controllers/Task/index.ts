import { Request, Response, NextFunction } from 'express';
import Task from '../../models/taskModel';
import Project from '../../models/projectModel';
import { CustomError } from '../../middleware/error';

export const createTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, description, projectId, assignedTo, status, dueDate, priority } = req.body;
        const owner = req.user?._id; // Assuming user ID is available from authentication middleware

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return next(new CustomError('Project not found', 404));
        }

        // Ensure the user creating the task owns the project
        if (project.owner.toString() !== owner.toString()) {
            return next(new CustomError('You are not authorized to create tasks in this project', 403));
        }

        const task = await Task.create({
            name,
            description,
            project: projectId,
            assignedTo,
            status,
            dueDate,
            priority,
            createdBy: owner,
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task,
        });
    } catch (error) {
        next(error);
    }
};

export const getTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const owner = req.user?._id;

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const tasks = await Task.find({}).populate({
            path: 'project',
            match: { owner: owner } // Only return tasks for projects owned by the user
        });

        // Filter out tasks where the project match failed (i.e., project is not owned by the user)
        const userTasks = tasks.filter(task => task.project !== null);

        res.status(200).json({
            success: true,
            tasks: userTasks,
        });
    } catch (error) {
        next(error);
    }
};

export const getTasksByProjectId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { projectId } = req.params;
        const owner = req.user?._id;
        console.log(owner, projectId, "here is the user"); 

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const project = await Project.findById(projectId);
        if (!project || project.owner.toString() !== owner.toString()) {
            return next(new CustomError('Project not found or unauthorized', 404));
        }

        const tasks = await Task.find({ project: projectId }).populate('createdBy');

        res.status(200).json({
            success: true,
            tasks,
        });


    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const owner = req.user?._id;

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const task = await Task.findById(id).populate({
            path: 'project',
            match: { owner: owner }
        });

        if (!task || !task.project) {
            return next(new CustomError('Task not found or you do not have permission to view', 404));
        }

        res.status(200).json({
            success: true,
            task,
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { name, description, assignedTo, status, dueDate } = req.body;
        const owner = req.user?._id;

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const task = await Task.findById(id).populate({
            path: 'project',
            match: { owner: owner }
        });

        if (!task || !task.project) {
            return next(new CustomError('Task not found or you do not have permission to update', 404));
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id },
            { name, description, assignedTo, status, dueDate },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            task: updatedTask,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const owner = req.user?._id;

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const task = await Task.findById(id).populate({
            path: 'project',
            match: { owner: owner }
        });

        if (!task || !task.project) {
            return next(new CustomError('Task not found or you do not have permission to delete', 404));
        }

        await Task.deleteOne({ _id: id });

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};