import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RoomStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useStripe, initStripe } from '@stripe/stripe-react-native';
import { createBooking, updateBookingPayment, createPaymentIntent, handleFailedPayment } from '../services/FirestoreService';
import { useAuth } from '../contexts/AuthContext';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

// Stripe test publishable key
const STRIPE_TEST_KEY = 'pk_test_51QgghQRwXoewKBeCzVpDaRgBdrgPKTIwiFG9zt6E9AHiLODTgOo24YHLip6cfVzsEhNL1c2UVY8v1LbN8mTyXhud004YiMeAi6';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RoomStackParamList, 'Payment'>;

type RouteParams = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  guestName: string;
  email: string;
  phone: string;
  totalPrice: number;
};

export const PaymentScreen = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<RouteProp<RoomStackParamList, 'Payment'>>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    initStripe({
      publishableKey: STRIPE_TEST_KEY,
      merchantIdentifier: 'merchant.com.indianahotels',
    });
  }, []);

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to make a payment');
      return;
    }

    try {
      setLoading(true);
      setPaymentError(null);

      // Create the booking first
      const bookingData = {
        roomId: route.params.roomId,
        userId: user.uid,
        checkIn: new Date(route.params.checkIn),
        checkOut: new Date(route.params.checkOut),
        guestCount: route.params.numGuests,
        guestName: route.params.guestName,
        email: route.params.email,
        phone: route.params.phone,
        totalPrice: route.params.totalPrice,
        status: 'pending' as const
      };

      const bookingId = await createBooking(bookingData);

      // Create payment intent with correct parameters
      const paymentIntent = await createPaymentIntent(route.params.totalPrice, bookingId);

      if (!paymentIntent?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent.clientSecret,
        merchantDisplayName: 'Indiana Hotels',
        style: 'automatic',
        defaultBillingDetails: {
          name: route.params.guestName,
          email: route.params.email
        }
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // Handle failed payment
        await handleFailedPayment(bookingId);
        throw new Error(presentError.message);
      }

      // Update booking with successful payment
      await updateBookingPayment(bookingId, paymentIntent.paymentId, '');

      // Navigate to success screen
      navigation.navigate('BookingDetails', {
        booking: {
          id: bookingId,
          roomId: route.params.roomId,
          checkIn: route.params.checkIn,
          checkOut: route.params.checkOut,
          numGuests: route.params.numGuests,
          guestName: route.params.guestName,
          email: route.params.email,
          phone: route.params.phone,
          totalPrice: route.params.totalPrice,
          status: 'confirmed',
          paymentStatus: 'completed',
          receiptUrl: `https://dashboard.stripe.com/receipts/${paymentIntent.paymentId}`
        }
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
      Alert.alert('Payment Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Payment Details</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Check-in</Text>
            <Text style={styles.value}>{formatDate(route.params.checkIn)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Check-out</Text>
            <Text style={styles.value}>{formatDate(route.params.checkOut)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Guests</Text>
            <Text style={styles.value}>{route.params.numGuests}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Guest Name</Text>
            <Text style={styles.value}>{route.params.guestName}</Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.price}>£{route.params.totalPrice}</Text>
        </View>

        <View style={styles.testModeInfo}>
          <Text style={styles.testModeTitle}>Test Mode</Text>
          <Text style={styles.testModeText}>Use these test card details:</Text>
          <Text style={styles.testModeText}>Card number: 4242 4242 4242 4242</Text>
          <Text style={styles.testModeText}>Expiry: Any future date</Text>
          <Text style={styles.testModeText}>CVC: Any 3 digits</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Pay Now (Test Mode)</Text>
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
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textLight,
  },
  value: {
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
  testModeInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  testModeTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  testModeText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
}); 