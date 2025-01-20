import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Chip, Searchbar, Menu } from 'react-native-paper';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { getAllBookings, updateBooking } from '../services/FirestoreService';
import type { Booking } from '../services/FirestoreService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingsStackParamList } from '../navigation/types';

type StaffBookingsNavigationProp = NativeStackNavigationProp<BookingsStackParamList>;

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const StaffBookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation<StaffBookingsNavigationProp>();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.success;
      case 'completed':
        return COLORS.info;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const filteredBookings = bookings
    .filter(booking => 
      statusFilter === 'all' || booking.status === statusFilter
    )
    .filter(booking =>
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bookings Management</Text>
        <Searchbar
          placeholder="Search bookings..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button 
              mode="outlined" 
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            >
              Filter: {statusFilter.toUpperCase()}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setStatusFilter('all'); setMenuVisible(false); }} title="All" />
          <Menu.Item onPress={() => { setStatusFilter('pending'); setMenuVisible(false); }} title="Pending" />
          <Menu.Item onPress={() => { setStatusFilter('confirmed'); setMenuVisible(false); }} title="Confirmed" />
          <Menu.Item onPress={() => { setStatusFilter('completed'); setMenuVisible(false); }} title="Completed" />
          <Menu.Item onPress={() => { setStatusFilter('cancelled'); setMenuVisible(false); }} title="Cancelled" />
        </Menu>
      </View>

      <View style={styles.content}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Chip 
                    mode="outlined" 
                    style={[styles.statusChip, { borderColor: getStatusColor(booking.status) }]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </Chip>
                  <Text style={styles.price}>£{booking.totalPrice}</Text>
                </View>

                <View style={styles.bookingInfo}>
                  <Text style={styles.guestName}>{booking.guestName}</Text>
                  <Text style={styles.dates}>
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </Text>
                  <Text style={styles.email}>{booking.email}</Text>
                </View>

                <View style={styles.actions}>
                  {booking.status === 'pending' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateStatus(booking.id, 'confirmed')}
                      style={styles.actionButton}
                    >
                      Confirm
                    </Button>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateStatus(booking.id, 'completed')}
                      style={styles.actionButton}
                    >
                      Complete
                    </Button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button
                      mode="outlined"
                      onPress={() => handleUpdateStatus(booking.id, 'cancelled')}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('BookingDetails', { booking })}
                  >
                    View Details
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterButton: {
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusChip: {
    borderWidth: 1,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  bookingInfo: {
    marginVertical: SPACING.sm,
  },
  guestName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dates: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    minWidth: 100,
  },
  cancelButton: {
    minWidth: 100,
    borderColor: COLORS.error,
  },
}); 