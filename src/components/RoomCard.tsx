import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Room } from '../types/room';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { getRoomImage } from '../utils/roomImages';
import { Ionicons } from '@expo/vector-icons';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
  const imageSource = getRoomImage(room.images);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(room)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image 
            source={imageSource} 
            style={styles.image}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={48} color={COLORS.gray} />
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        
        {/* Room Type Overlay */}
        <View style={styles.typeOverlay}>
          <Text style={styles.typeText}>{room.type}</Text>
          <Text style={styles.priceOverlay}>£{room.price}/night</Text>
        </View>

        {/* Bottom Info Overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.guestsInfo}>
            <Ionicons name="people-outline" size={16} color={COLORS.white} />
            <Text style={styles.guestsText}>{room.capacity} guests</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: room.status === 'available' ? COLORS.success : COLORS.error }
          ]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {room.status === 'available' ? 'available' : 'booked'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{room.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {room.description || 'A comfortable room with modern amenities.'}
        </Text>

        <View style={styles.amenities}>
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <View key={index} style={styles.amenityItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.amenity}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  noImageText: {
    marginTop: SPACING.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray,
  },
  typeOverlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeText: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  priceOverlay: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  guestsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  guestsText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  statusText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  amenity: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
  },
}); 