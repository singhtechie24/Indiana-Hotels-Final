import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RoomStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types/room';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const db = getFirestore();

type RoomDetailsRouteProp = RouteProp<RoomStackParamList, 'RoomDetails'>;
type RoomDetailsNavigationProp = NativeStackNavigationProp<RoomStackParamList>;

export const RoomDetailsScreen = () => {
  const navigation = useNavigation<RoomDetailsNavigationProp>();
  const route = useRoute<RoomDetailsRouteProp>();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomRef = doc(db, 'rooms', route.params.roomId);
        const roomSnap = await getDoc(roomRef);
        
        if (roomSnap.exists()) {
          setRoom({ id: roomSnap.id, ...roomSnap.data() } as Room);
        } else {
          setError('Room not found');
        }
      } catch (err) {
        setError('Failed to load room details');
        console.error('Error fetching room:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [route.params.roomId]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    
    // Update the parent tab navigator options
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    } as BottomTabNavigationOptions);

    // Cleanup function to restore tab bar when leaving screen
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined
      } as BottomTabNavigationOptions);
    };
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Room not found'}</Text>
      </View>
    );
  }

  const amenityIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    'wifi': 'wifi-outline',
    'tv': 'tv-outline',
    'ac': 'thermometer-outline',
    'minibar': 'wine-outline',
    'balcony': 'sunny-outline',
    'workspace': 'desktop-outline',
    'bathroom': 'water-outline',
    'bed': 'bed-outline',
  };

  const handleBookNow = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to book a room',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login' as any) },
        ]
      );
      return;
    }

    if (room.status !== 'available') {
      Alert.alert('Not Available', 'This room is currently not available for booking.');
      return;
    }

    navigation.navigate('BookingForm', { roomId: room.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Image Slider */}
      <View style={styles.imageContainer}>
        {room.images && room.images.length > 0 ? (
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {room.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            ))}
          </Animated.ScrollView>
        ) : (
          <Image
            source={require('../../assets/Hotel-background.jpeg')}
            style={styles.mainImage}
            resizeMode="cover"
          />
        )}

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </View>
        </TouchableOpacity>

        {/* Favorite Button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <View style={styles.iconButton}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? COLORS.error : COLORS.text} 
            />
          </View>
        </TouchableOpacity>

        {/* Rating and Price Overlay */}
        <View style={styles.imageOverlay}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={COLORS.warning} />
            <Text style={styles.rating}>4.9</Text>
            <Text style={styles.ratingCount}>(13K)</Text>
          </View>
          <Text style={styles.overlayPrice}>${room.price}</Text>
        </View>

        {/* Pagination Dots */}
        {room.images && room.images.length > 1 && (
          <View style={styles.pagination}>
            {room.images.map((_, index) => {
              const inputRange = [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ];
              const dotOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.5, 1, 0.5],
                extrapolate: 'clamp',
              });
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { opacity: dotOpacity, width: dotWidth }
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>

      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        {/* Room Name and Location */}
        <Text style={styles.roomName}>{room.name}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.location}>Indiana Hotel</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>{room.description}</Text>
        </View>

        {/* What We Offer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons 
                  name={amenityIcons[amenity.toLowerCase()] || 'checkmark-circle-outline'} 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>${room.price}</Text>
          <Text style={styles.priceUnit}>/night</Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, { opacity: room.status === 'available' ? 1 : 0.5 }]}
          onPress={handleBookNow}
          disabled={room.status !== 'available'}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
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
  imageContainer: {
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: SPACING.lg,
    zIndex: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: SPACING.lg,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageOverlay: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  rating: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
  ratingCount: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  overlayPrice: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  paginationDotActive: {
    opacity: 1,
    width: 24,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  roomName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  location: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textLight,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  description: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },
  amenityItem: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.lg * 3) / 4,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  amenityText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceAmount: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
  },
  priceUnit: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
  },
  bookButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
}); 