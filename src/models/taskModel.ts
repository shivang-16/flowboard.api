import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    name: string;
    description?: string;
    project: mongoose.Schema.Types.ObjectId;
    assignedTo?: mongoose.Schema.Types.ObjectId;
    status: 'todo' | 'in-progress' | 'done';
    dueDate?: Date;
    createdAt: Date;
}

const TaskSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'todo' },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;