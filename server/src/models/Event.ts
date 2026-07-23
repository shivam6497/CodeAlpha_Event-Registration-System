import mongoose, { Schema, Document } from 'mongoose';
import { IEvent } from '../types';

export interface IEventDocument extends IEvent, Document {}

const EventSchema = new Schema<IEventDocument>(
  {
    title:           { type: String, required: true, trim: true },
    description:     { type: String, required: true },
    location:        { type: String, required: true },
    date:            { type: Date,   required: true },
    capacity:        { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0 },
    organizer:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category:        { type: String, required: true },
    imageUrl:        { type: String },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEventDocument>('Event', EventSchema);
