export type RoomType = 'standard' | 'deluxe' | 'suite';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  price: number;
  capacity: number;
  description: string;
  images: string[];
  amenities: string[];
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'do-not-disturb';
  lastUpdated: Date;
  updatedBy: string;
}

export interface RoomFilters {
  type?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus?: 'pending' | 'completed' | 'refunded';
  guestCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  paymentId?: string;
  receiptUrl?: string;
  guestName: string;
  email: string;
  phone: string;
} 