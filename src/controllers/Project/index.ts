import { Request, Response, NextFunction } from 'express';
import Project from '../../models/projectModel';
import { CustomError } from '../../middleware/error';
import { User } from "../../models/userModel"; // Import the User model
import Task from '../../models/taskModel';

export const createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, description } = req.body;
        const owner = req.user?._id;
        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const project = await Project.create({
            name,
            description,
            owner,
            
        });

        // Add the project to the user's projects array
        await User.findByIdAndUpdate(
            owner,
            { $push: { projects: project._id } },
            { new: true, useFindAndModify: false }
        );

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project,
        });
    } catch (error) {
        next(error);
    }
};

export const getProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const owner = req.user?._id;

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const projects = await Project.find({ owner });

        res.status(200).json({
            success: true,
            projects,
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectById = async (
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

        const project = await Project.findOne({ _id: id, owner });

        if (!project) {
            return next(new CustomError('Project not found', 404));
        }

        res.status(200).json({
            success: true,
            project,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { name, description, statuses } = req.body;
        const owner = req.user?._id;

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const updateFields: { name?: string; description?: string; statuses?: any[] } = {};
        if (name) updateFields.name = name;
        if (description) updateFields.description = description;
        if (statuses) updateFields.statuses = statuses;

        const project = await Project.findOneAndUpdate(
            { _id: id, owner },
            updateFields,
            { new: true, runValidators: true }
        );

        if (!project) {
            return next(new CustomError('Project not found or you do not have permission to update', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (
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

        // Check if there are any tasks assigned to this project
        const tasksCount = await Task.countDocuments({ project: id });
        if (tasksCount > 0) {
            return next(new CustomError('Cannot delete project: It has assigned tasks.', 400));
        }

        const project = await Project.findOneAndDelete({ _id: id, owner });

        if (!project) {
            return next(new CustomError('Project not found or you do not have permission to delete', 404));
        }

        // Remove the project from all users' projects array
        await User.updateMany(
            { projects: id },
            { $pull: { projects: id } }
        );

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};