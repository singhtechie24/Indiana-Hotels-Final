import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RoomStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { rooms } from '../data/rooms';
import { useAuth } from '../contexts/AuthContext';

type RoomDetailsRouteProp = RouteProp<RoomStackParamList, 'RoomDetails'>;
type RoomDetailsNavigationProp = NativeStackNavigationProp<RoomStackParamList, 'RoomDetails'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const RoomDetailsScreen = () => {
  const navigation = useNavigation<RoomDetailsNavigationProp>();
  const route = useRoute<RoomDetailsRouteProp>();
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const room = rooms.find(r => r.id === route.params.roomId);

  if (!room) {
    return (
      <View style={styles.container}>
        <Text>Room not found</Text>
      </View>
    );
  }

  const handleBookNow = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to book a room',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => {
              // We'll implement this navigation later
              console.log('Navigate to login');
            },
          },
        ]
      );
      return;
    }

    if (!room.available) {
      Alert.alert('Not Available', 'This room is currently not available for booking.');
      return;
    }

    // We'll implement the booking process later
    console.log('Book room:', room.id);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View>
          <FlatList
            data={room.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={ev => {
              const newIndex = Math.round(ev.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
              />
            )}
          />
          
          {/* Image Pagination Dots */}
          <View style={styles.pagination}>
            {room.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{room.name}</Text>
              <Text style={styles.type}>{room.type.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.price}>${room.price}</Text>
              <Text style={styles.perNight}>/night</Text>
            </View>
          </View>

          {/* Availability Badge */}
          <View
            style={[
              styles.badge,
              { backgroundColor: room.available ? COLORS.primary : COLORS.gray },
            ]}
          >
            <Text style={styles.badgeText}>
              {room.available ? 'Available' : 'Booked'}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{room.description}</Text>

          {/* Capacity */}
          <Text style={styles.sectionTitle}>Capacity</Text>
          <Text style={styles.capacity}>Up to {room.capacity} guests</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesList}>
            {room.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={styles.amenityText}>• {amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            !room.available && styles.bookButtonDisabled,
          ]}
          onPress={handleBookNow}
          disabled={!room.available}
        >
          <Text style={styles.bookButtonText}>
            {room.available ? 'Book Now' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: SPACING.md,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  paginationDotActive: {
    opacity: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  name: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  type: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray,
  },
  price: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.primary,
    textAlign: 'right',
  },
  perNight: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray,
    textAlign: 'right',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  description: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  capacity: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    width: '50%',
    marginBottom: SPACING.sm,
  },
  amenityText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  footer: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  bookButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
}); 