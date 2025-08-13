export interface User {
  id: string;
  name: string;
  title: string;
  university?: string;
  location: string;
  avatar: string;
  specialties: string[];
  experience: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  bio: string;
  portfolio: PortfolioItem[];
  isAvailable: boolean;
  services?: Service[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  year: number;
}

export interface Session {
  id: string;
  consultantId: string;
  clientId: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  participantAvatars: { [userId: string]: string };
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}