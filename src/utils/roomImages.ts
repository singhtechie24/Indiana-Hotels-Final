import { RoomType } from '../types/room';

export const getRoomImage = (images: string[] | undefined) => {
  // If there are valid URLs in the images array, use the first one
  if (images && images.length > 0 && images[0].startsWith('http')) {
    return { uri: images[0] };
  }
  return null;
};

export const getRoomImages = (images: string[] | undefined) => {
  if (images && images.length > 0) {
    return images.map(image => ({ uri: image }));
  }
  return [];
}; 