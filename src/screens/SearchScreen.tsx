import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RoomFilters } from '../components/RoomFilters';
import { getRooms } from '../services/FirestoreService';
import { Room, RoomType } from '../types/room';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Define available room types
const ROOM_TYPES: RoomType[] = ['standard', 'deluxe', 'suite'];

type RoomDetailsParams = {
  RoomDetails: { roomId: string };
};

// Separate RoomCard component with animation
const RoomCard = React.memo(({ room, onPress, index }: { room: Room; onPress: () => void; index: number }) => {
  const [imageError, setImageError] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay: index * 100,
    }).start();
  }, []);

  const amenityIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'wifi': 'wifi-outline',
    'tv': 'tv-outline',
    'ac': 'thermometer-outline',
    'minibar': 'wine-outline',
    'balcony': 'sunny-outline',
    'workspace': 'desktop-outline',
  };

  return (
    <Animated.View
      style={[{
        transform: [{
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })
        }],
        opacity: animatedValue,
      }]}
    >
      <TouchableOpacity 
        style={styles.roomCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {room.images && room.images.length > 0 && !imageError ? (
            <>
              <Image 
                source={{ uri: room.images[0] }}
                style={styles.roomImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'transparent']}
                style={styles.imageOverlay}
              >
                <View style={styles.roomTypeChip}>
                  <Text style={styles.roomTypeText}>{room.type}</Text>
                </View>
                <BlurView intensity={Platform.OS === 'ios' ? 60 : 100} style={styles.priceTag}>
                  <Text style={styles.priceText}>£{room.price}</Text>
                  <Text style={styles.perNightText}>/night</Text>
                </BlurView>
              </LinearGradient>
            </>
          ) : (
            <View style={[styles.roomImage, styles.placeholderContainer]}>
              <Ionicons name="bed-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.placeholderText}>
                {imageError ? 'Failed to load image' : 'No image available'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <View style={styles.roomTitleContainer}>
              <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
              <View style={styles.roomDetails}>
                <View style={styles.roomDetailItem}>
                  <Ionicons name="people-outline" size={16} color={COLORS.textLight} />
                  <Text style={styles.roomDetailText}>{room.capacity} guests</Text>
                </View>
                <View style={styles.roomDetailDivider} />
                <View style={styles.roomDetailItem}>
                  <Ionicons 
                    name="ellipse" 
                    size={8} 
                    color={room.status === 'available' ? COLORS.success : COLORS.error} 
                  />
                  <Text style={[
                    styles.roomDetailText,
                    { color: room.status === 'available' ? COLORS.success : COLORS.error }
                  ]}>
                    {room.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.amenitiesContainer}>
            {room.amenities.slice(0, 4).map((amenity, index) => (
              <View key={index} style={styles.amenityChip}>
                <Ionicons 
                  name={amenityIcons[amenity.toLowerCase()] || 'checkmark-circle-outline'} 
                  size={16} 
                  color={COLORS.primary} 
                />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {room.amenities.length > 4 && (
              <View style={styles.amenityChip}>
                <Text style={styles.amenityText}>+{room.amenities.length - 4}</Text>
              </View>
            )}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {room.description}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedType, setSelectedType] = useState<RoomType | null>(null);
  const [selectedMinPrice, setSelectedMinPrice] = useState(0);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(1000);
  const [selectedCapacity, setSelectedCapacity] = useState(1);

  const fetchRooms = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const fetchedRooms = await getRooms();
      setRooms(fetchedRooms as Room[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms(true);
  };

  const handleResetFilters = () => {
    setSelectedType(null);
    setSelectedMinPrice(0);
    setSelectedMaxPrice(1000);
    setSelectedCapacity(1);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const typeMatch = !selectedType || room.type === selectedType;
      const priceMatch = room.price >= selectedMinPrice && room.price <= selectedMaxPrice;
      const capacityMatch = room.capacity >= selectedCapacity;
      return typeMatch && priceMatch && capacityMatch;
    });
  }, [rooms, selectedType, selectedMinPrice, selectedMaxPrice, selectedCapacity]);

  const renderRoomCard = ({ item, index }: { item: Room; index: number }) => (
    <RoomCard
      room={item}
      index={index}
      onPress={() => navigation.navigate('RoomDetails', { roomId: item.id })}
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bed-outline" size={48} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No Rooms Found</Text>
      <Text style={styles.emptyText}>Try adjusting your filters</Text>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetFilters}
      >
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchRooms()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.title}>Find Your Room</Text>
            <Text style={styles.subtitle}>
              {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} available
            </Text>
          </View>
        </View>
      </View>

      <RoomFilters
        roomTypes={ROOM_TYPES}
        activeRoomType={selectedType}
        onRoomTypePress={setSelectedType}
        minPrice={0}
        maxPrice={1000}
        selectedMinPrice={selectedMinPrice}
        selectedMaxPrice={selectedMaxPrice}
        onPriceChange={(min, max) => {
          setSelectedMinPrice(min);
          setSelectedMaxPrice(max);
        }}
        capacity={selectedCapacity}
        onCapacityChange={setSelectedCapacity}
        onResetFilters={handleResetFilters}
      />

      <FlatList
        data={filteredRooms}
        renderItem={renderRoomCard}
        keyExtractor={room => room.id}
        contentContainerStyle={styles.roomList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
  },
  roomList: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  roomCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
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
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surfaceVariant,
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  roomTypeChip: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  roomTypeText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textTransform: 'capitalize',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  priceText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.white,
  },
  perNightText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    marginLeft: 2,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
  },
  placeholderText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  roomInfo: {
    padding: SPACING.md,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  roomTitleContainer: {
    flex: 1,
  },
  roomName: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roomDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  roomDetailDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.surfaceVariant,
    marginHorizontal: SPACING.sm,
  },
  roomDetailText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  amenityText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textLight,
  },
  description: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  resetButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  resetButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
  },
}); 