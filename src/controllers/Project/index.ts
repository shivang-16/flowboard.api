import { Request, Response, NextFunction } from 'express';
import Project from '../../models/projectModel';
import { CustomError } from '../../middleware/error';

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
        const { name, description } = req.body;
        const owner = req.user?._id;

        if (!owner) {
            return next(new CustomError('User not authenticated', 401));
        }

        const project = await Project.findOneAndUpdate(
            { _id: id, owner },
            { name, description },
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

        const project = await Project.findOneAndDelete({ _id: id, owner });

        if (!project) {
            return next(new CustomError('Project not found or you do not have permission to delete', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};