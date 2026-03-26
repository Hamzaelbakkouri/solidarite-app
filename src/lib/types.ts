import { ObjectId } from "mongodb";

export type UserRole = "giver" | "agent" | "admin";
export type AgentStatus = "pending" | "verified" | "rejected";
export type PostType = "money" | "product";
export type PostStatus = "available" | "reserved" | "completed";
export type RequestStatus = "pending" | "approved" | "rejected" | "completed";

export interface User {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  name: string;
  role: UserRole;
  phone?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  // Giver specific
  sold?: number;
  donationsCount?: number;
  organization?: string; // company or association name
  // Agent specific
  agentStatus?: AgentStatus;
  agentDocuments?: string[];
  activeRequests?: number; // max 3
  currentNeed?: string;
  volunteerHours?: number;
  availability?: string;
  skills?: string;
  cin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id?: ObjectId;
  giverId: ObjectId;
  giverName: string;
  type: PostType;
  status: PostStatus;
  // For money posts
  amount?: number;
  // For product posts
  title?: string;
  description?: string;
  photos?: string[];
  // Common
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  _id?: ObjectId;
  postId: ObjectId;
  agentId: ObjectId;
  agentName: string;
  giverId: ObjectId;
  giverName: string;
  status: RequestStatus;
  postType: PostType;
  amount?: number;
  productTitle?: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id?: ObjectId;
  senderId: ObjectId;
  receiverId: ObjectId;
  requestId: ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Activity {
  _id?: ObjectId;
  userId: ObjectId;
  type: "donation_posted" | "request_made" | "request_approved" | "request_rejected" | "donation_completed" | "agent_verified";
  description: string;
  relatedPostId?: ObjectId;
  relatedRequestId?: ObjectId;
  createdAt: Date;
}
