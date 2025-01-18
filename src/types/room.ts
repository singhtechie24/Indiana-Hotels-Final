export type RoomType = 'single' | 'double' | 'suite' | 'deluxe';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface RoomFilters {
  type?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
} 