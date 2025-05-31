import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description?: string;
    owner: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    analytics: {
        totalTasks: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        overdueTasks: { type: Number, default: 0 },
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