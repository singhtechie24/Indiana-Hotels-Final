import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RoomStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { Room } from '../types/room';
import { getRoom, checkRoomAvailability } from '../services/FirestoreService';
import DateTimePicker from '@react-native-community/datetimepicker';

type BookingFormScreenNavigationProp = NativeStackNavigationProp<RoomStackParamList, 'BookingForm'>;

type RouteParams = {
  roomId: string;
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

export const BookingFormScreen = () => {
  const navigation = useNavigation<BookingFormScreenNavigationProp>();
  const route = useRoute();
  const { roomId } = route.params as RouteParams;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [numGuests, setNumGuests] = useState('1');
  const [guestName, setGuestName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomData = await getRoom(roomId);
        setRoom(roomData as Room);
      } catch (error) {
        console.error('Error fetching room:', error);
        Alert.alert('Error', 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleCheckAvailability = async () => {
    if (!room) return;

    setChecking(true);
    try {
      const isAvailable = await checkRoomAvailability(
        roomId,
        checkIn.toISOString(),
        checkOut.toISOString()
      );

      if (isAvailable) {
        const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = room.price * totalNights;

        navigation.navigate('Payment', {
          roomId,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          numGuests: parseInt(numGuests),
          guestName,
          email,
          phone,
          totalPrice,
        });
      } else {
        Alert.alert(
          'Not Available',
          'The room is not available for the selected dates. Please choose different dates.'
        );
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      Alert.alert('Error', 'Failed to check room availability');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Room not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Booking Details</Text>
        <Text style={styles.roomName}>{room.name}</Text>

        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowCheckIn(true)}
          >
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateValue}>
              {formatDate(checkIn)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowCheckOut(true)}
          >
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateValue}>
              {formatDate(checkOut)}
            </Text>
          </TouchableOpacity>

          {(showCheckIn || showCheckOut) && (
            <DateTimePicker
              value={showCheckIn ? checkIn : checkOut}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={showCheckIn ? new Date() : checkIn}
              onChange={(event, selectedDate) => {
                if (showCheckIn) {
                  setShowCheckIn(Platform.OS === 'ios');
                  if (selectedDate) {
                    setCheckIn(selectedDate);
                    // Ensure checkout is after checkin
                    if (selectedDate >= checkOut) {
                      setCheckOut(new Date(selectedDate.getTime() + 86400000));
                    }
                  }
                } else {
                  setShowCheckOut(Platform.OS === 'ios');
                  if (selectedDate) {
                    setCheckOut(selectedDate);
                  }
                }
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          
          <Input
            label="Number of Guests"
            value={numGuests}
            onChangeText={setNumGuests}
            keyboardType="numeric"
            maxLength={2}
          />

          <Input
            label="Full Name"
            value={guestName}
            onChangeText={setGuestName}
            autoCapitalize="words"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price per night</Text>
          <Text style={styles.price}>£{room.price}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, checking && styles.buttonDisabled]}
          onPress={handleCheckAvailability}
          disabled={checking || !guestName || !email || !phone}
        >
          {checking ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Check Availability & Proceed</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roomName: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  dateSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dateInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dateLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  dateValue: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  priceLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  price: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
  },
}); 