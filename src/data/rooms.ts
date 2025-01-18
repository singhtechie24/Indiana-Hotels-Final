import { Room } from '../types/room';

export const rooms: Room[] = [
  {
    id: '1',
    name: 'Deluxe Ocean View',
    type: 'deluxe',
    price: 299,
    capacity: 2,
    description: 'Luxurious room with stunning ocean views, featuring a king-size bed and private balcony.',
    amenities: ['Ocean View', 'King Bed', 'Balcony', 'Mini Bar', 'Free Wi-Fi', 'Room Service'],
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3'
    ],
    available: true
  },
  {
    id: '2',
    name: 'Premium Suite',
    type: 'suite',
    price: 499,
    capacity: 4,
    description: 'Spacious suite with separate living area, perfect for families or extended stays.',
    amenities: ['Living Room', '2 Bathrooms', 'Kitchen', 'Work Desk', 'Free Wi-Fi', '24/7 Service'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3'
    ],
    available: true
  },
  {
    id: '3',
    name: 'Standard Double',
    type: 'double',
    price: 199,
    capacity: 2,
    description: 'Comfortable room with two double beds, ideal for friends or business travelers.',
    amenities: ['2 Double Beds', 'Work Desk', 'Free Wi-Fi', 'TV', 'Coffee Maker'],
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3'
    ],
    available: true
  },
  {
    id: '4',
    name: 'Single Room',
    type: 'single',
    price: 149,
    capacity: 1,
    description: 'Cozy room perfect for solo travelers, featuring all essential amenities.',
    amenities: ['Single Bed', 'Work Desk', 'Free Wi-Fi', 'TV', 'Coffee Maker'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3'
    ],
    available: false
  }
]; 