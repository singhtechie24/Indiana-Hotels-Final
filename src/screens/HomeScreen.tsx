import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Dimensions, StatusBar, Platform, ActivityIndicator, TextInput, GestureResponderEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { GuestTabParamList } from '../navigation/types';
import { Room } from '../types/room';
import { getRooms } from '../services/FirestoreService';

type HomeScreenNavigationProp = NativeStackNavigationProp<GuestTabParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function for navigation
  const navigateToSearch = () => {
    if (searchQuery.trim()) {
      // @ts-ignore - Nested navigation params issue
      navigation.navigate('Search', {
        screen: 'RoomList',
        params: { searchQuery: searchQuery.trim() }
      });
    } else {
      navigation.navigate('Search');
    }
  };

  const handleSearchPress = (_: GestureResponderEvent) => {
    navigateToSearch();
  };

  const navigateToRoomDetails = (roomId: string) => {
    // @ts-ignore - Nested navigation type issue
    navigation.navigate('Search', {
      screen: 'RoomList',
      params: undefined,
    });
    // After resetting to RoomList, navigate to RoomDetails
    setTimeout(() => {
      // @ts-ignore - Nested navigation type issue
      navigation.navigate('Search', {
        screen: 'RoomDetails',
        params: { roomId }
      });
    }, 0);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const allRooms = await getRooms();
        // Get only available rooms and sort by price (highest first) to show luxury rooms
        const availableRooms = (allRooms as Room[])
          .filter(room => room.status === 'available')
          .sort((a, b) => b.price - a.price);
        
        setAllRooms(availableRooms);
        setFeaturedRooms(availableRooms.slice(0, 3)); // Get top 3 rooms
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return allRooms.filter(room => {
      const nameMatch = room.name?.toLowerCase().includes(query) || false;
      const typeMatch = room.type?.toLowerCase().includes(query) || false;
      const descriptionMatch = room.description?.toLowerCase().includes(query) || false;
      const amenityMatch = room.amenities?.some(amenity => 
        amenity?.toLowerCase().includes(query)
      ) || false;

      return nameMatch || typeMatch || descriptionMatch || amenityMatch;
    });
  }, [searchQuery, allRooms]);

  const renderFeaturedRooms = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (featuredRooms.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No rooms available</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredRoomsContainer}
      >
        {featuredRooms.map((room) => (
          <TouchableOpacity 
            key={room.id} 
            style={styles.featuredCard}
            onPress={() => navigateToRoomDetails(room.id)}
          >
            <Image 
              source={room.images && room.images.length > 0 
                ? { uri: room.images[0] }
                : require('../../assets/Hotel-background.jpeg')}
              style={styles.featuredImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardOverlay}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{room.name}</Text>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardLocation}>{room.type}</Text>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>£{room.price}</Text>
                    <Text style={styles.priceUnit}>/night</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.hotelName}>Indiana Hotel</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Find Your Perfect Escape</Text>
          <Text style={styles.heroSubtitle}>Let's discover the world together</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rooms, amenities..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={navigateToSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {searchQuery.length > 0 && filteredRooms.length > 0 && (
            <View style={styles.searchResults}>
              {filteredRooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.searchResultItem}
                  onPress={() => navigateToRoomDetails(room.id)}
                >
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultTitle}>{room.name}</Text>
                    <Text style={styles.searchResultSubtitle}>
                      {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • £{room.price}/night
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              ))}
              {filteredRooms.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllResults}
                  onPress={handleSearchPress}
                >
                  <Text style={styles.viewAllResultsText}>View all results</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToSearch}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="bed-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Rooms</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Dining</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="airplane-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Travel</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Rooms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Rooms</Text>
            <TouchableOpacity onPress={navigateToSearch}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>

          {renderFeaturedRooms()}
        </View>

        {/* Special Offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.offerCard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerGradient}
            >
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Summer Special</Text>
                <Text style={styles.offerDescription}>Get 20% off on all suite bookings</Text>
                <TouchableOpacity style={styles.offerButton}>
                  <Text style={styles.offerButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 32,
    height: 32,
  },
  hotelName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  heroSection: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  searchResults: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  searchResultSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
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
        elevation: 2,
      },
    }),
  },
  actionText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
  },
  viewAllButton: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  featuredRoomsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  featuredCard: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: BORDER_RADIUS.lg,
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
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  cardContent: {
    gap: SPACING.xs,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.white,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLocation: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.white,
  },
  priceUnit: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    opacity: 0.8,
  },
  offerCard: {
    marginHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  offerGradient: {
    padding: SPACING.xl,
  },
  offerContent: {
    gap: SPACING.sm,
  },
  offerTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.white,
  },
  offerDescription: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  offerButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  offerButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  loadingContainer: {
    height: SCREEN_WIDTH * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: SCREEN_WIDTH * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textLight,
  },
  viewAllResults: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
    alignItems: 'center',
  },
  viewAllResultsText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
}); 