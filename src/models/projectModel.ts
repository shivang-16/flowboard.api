import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description?: string;
    owner: mongoose.Schema.Types.ObjectId;
    members: mongoose.Schema.Types.ObjectId[];
    tasks: mongoose.Schema.Types.ObjectId[];
    analytics: {
        todoTask: number;
        completedTasks: number;
        inProgressTasks: number;
    };
    statuses: {
        label: string;
        value: number;
    }
    createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    analytics: {
        todoTask: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        inProgressTasks: { type: Number, default: 0 },
    },
    statuses: [{
        label: { type: String, required: true },
        value: { type: Number, required: true },
    }],
}, {
    timestamps: true,
});

// Add a pre-save hook to set default statuses if the array is empty
ProjectSchema.pre('save', function(next) {
    if (this.isNew && (!Array.isArray(this.statuses) || this.statuses.length === 0)) {
        this.statuses = [
            { label: 'todo', value: 0 },
            { label: 'in-progress', value: 1 },
            { label: 'done', value: 2 },
        ];
    }
    next();
});

const Project = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;