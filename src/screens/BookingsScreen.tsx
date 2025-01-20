import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { getBookingsByUser } from '../services/FirestoreService';
import type { Booking } from '../services/FirestoreService';
import { Ionicons } from '@expo/vector-icons';

type BookingsScreenNavigationProp = NativeStackNavigationProp<BookingsStackParamList>;

export const BookingsScreen = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  const fetchBookings = async (isRefreshing = false) => {
    if (!user) return;
    
    try {
      if (!isRefreshing) setLoading(true);
      const userBookings = await getBookingsByUser(user.uid);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      case 'completed':
        return COLORS.accent;
      default:
        return COLORS.gray;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const checkOut = new Date(booking.checkOut);
    
    switch (filter) {
      case 'active':
        return checkOut >= now && booking.status !== 'cancelled';
      case 'past':
        return checkOut < now || booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const renderBookingCard = ({ item: booking }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BookingDetails', { 
        booking: {
          id: booking.id,
          roomId: booking.roomId,
          checkIn: booking.checkIn instanceof Date ? booking.checkIn.toISOString() : booking.checkIn,
          checkOut: booking.checkOut instanceof Date ? booking.checkOut.toISOString() : booking.checkOut,
          numGuests: booking.guestCount,
          guestName: booking.guestName,
          email: booking.email,
          phone: booking.phone,
          totalPrice: booking.totalPrice,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          receiptUrl: booking.receiptUrl
        }
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          />
          <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.price}>£{booking.totalPrice}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
          <Text style={styles.dateText}>
            {booking.checkIn instanceof Date ? booking.checkIn.toLocaleDateString() : new Date(booking.checkIn).toLocaleDateString()} - {booking.checkOut instanceof Date ? booking.checkOut.toLocaleDateString() : new Date(booking.checkOut).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.guestContainer}>
          <Ionicons name="people-outline" size={20} color={COLORS.gray} />
          <Text style={styles.guestText}>{booking.guestCount} Guests</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Bookings Found</Text>
      <Text style={styles.emptyText}>Your bookings will appear here</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'past' && styles.filterButtonActive]}
            onPress={() => setFilter('past')}
          >
            <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  cardBody: {
    marginTop: SPACING.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray,
  },
}); 