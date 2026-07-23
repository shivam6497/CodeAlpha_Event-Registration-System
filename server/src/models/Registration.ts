import mongoose, { Schema, Document } from 'mongoose';
import { IRegistration } from '../types';

export interface IRegistrationDocument extends IRegistration, Document {}

const RegistrationSchema = new Schema<IRegistrationDocument>(
  {
    user:         { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    event:        { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status:       { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One registration per user per event
RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model<IRegistrationDocument>('Registration', RegistrationSchema);
