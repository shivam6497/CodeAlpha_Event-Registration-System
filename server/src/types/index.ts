import { Request } from 'express';
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface IEvent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  date: Date;
  capacity: number;
  registeredCount: number;
  organizer: Types.ObjectId;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IRegistration {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: 'confirmed' | 'cancelled';
  registeredAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
