import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  ViewStyle,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RoomStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { cancelBooking, createServiceRequest, getReceiptUrl } from '../services/FirestoreService';
import { LinearGradient } from 'expo-linear-gradient';

type BookingDetailsRouteProp = RouteProp<RoomStackParamList, 'BookingDetails'>;
type BookingDetailsNavigationProp = NativeStackNavigationProp<RoomStackParamList>;

export const BookingDetailsScreen = () => {
  const navigation = useNavigation<BookingDetailsNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const [currentBooking, setCurrentBooking] = useState(route.params.booking);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState<'housekeeping' | 'maintenance' | 'roomService' | null>(null);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCancelBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to cancel a booking');
      return;
    }

    if (currentBooking.status === 'cancelled') {
      Alert.alert('Error', 'This booking is already cancelled');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await cancelBooking(currentBooking.id);
              
              if (success) {
                const updatedBooking = {
                  ...currentBooking,
                  status: 'cancelled'
                };
                setCurrentBooking(updatedBooking);
                Alert.alert('Success', 'Your booking has been cancelled successfully.', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                throw new Error('Failed to cancel booking');
              }
            } catch (error: any) {
              console.error('Error cancelling booking:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to cancel booking. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleServiceRequest = async (type: 'housekeeping' | 'maintenance' | 'roomService') => {
    if (!user) return;

    setServiceType(type);
    
    const serviceMessages = {
      housekeeping: 'Request room cleaning service?',
      maintenance: 'Request maintenance service?',
      roomService: 'Request room service?'
    };

    Alert.alert(
      'Service Request',
      serviceMessages[type],
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setServiceType(null) },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setLoading(true);
              await createServiceRequest({
                roomId: currentBooking.roomId,
                type,
                description: `${type} request for booking ${currentBooking.id}`,
                userId: user.uid
              });
              Alert.alert('Success', 'Service request has been submitted successfully.');
            } catch (error) {
              console.error('Error creating service request:', error);
              Alert.alert('Error', 'Failed to submit service request. Please try again.');
            } finally {
              setLoading(false);
              setServiceType(null);
            }
          }
        }
      ]
    );
  };

  const handleDownloadReceipt = async () => {
    if (currentBooking.paymentStatus !== 'completed') {
      Alert.alert('Not Available', 'Receipt is only available for completed payments.');
      return;
    }

    try {
      setLoading(true);
      const receiptUrl = await getReceiptUrl(currentBooking.id);
      if (receiptUrl) {
        await Linking.openURL(receiptUrl);
      } else {
        Alert.alert('Error', 'Receipt not found.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert('Error', 'Failed to download receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status: string): ViewStyle => ({
    backgroundColor: 
      status === 'confirmed' ? COLORS.success + '20' :
      status === 'cancelled' ? COLORS.error + '20' :
      status === 'completed' ? COLORS.accent + '20' :
      COLORS.gray + '20'
  });

  const getStatusColor = (status: string): string => 
    status === 'confirmed' ? COLORS.success :
    status === 'cancelled' ? COLORS.error :
    status === 'completed' ? COLORS.accent :
    COLORS.gray;

  const getPaymentStatusStyle = (status: string): ViewStyle => ({
    backgroundColor: 
      status === 'completed' ? COLORS.success + '20' :
      status === 'failed' ? COLORS.error + '20' :
      status === 'refunded' ? COLORS.accent + '20' :
      COLORS.gray + '20'
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, getStatusStyle(currentBooking.status)]}>
              <Ionicons 
                name={
                  currentBooking.status === 'confirmed' ? 'checkmark-circle' :
                  currentBooking.status === 'cancelled' ? 'close-circle' :
                  currentBooking.status === 'completed' ? 'flag' : 'time'
                } 
                size={16} 
                color={getStatusColor(currentBooking.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(currentBooking.status) }]}>
                {currentBooking.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.dateSection}>
            <View style={styles.dateRow}>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>CHECK-IN</Text>
                <Text style={styles.dateValue}>{formatDate(currentBooking.checkIn)}</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>CHECK-OUT</Text>
                <Text style={styles.dateValue}>{formatDate(currentBooking.checkOut)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color={COLORS.gray} />
              <Text style={styles.infoText}>{currentBooking.guestCount} Guests</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={COLORS.gray} />
              <Text style={styles.infoText}>£{currentBooking.totalPrice}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color={COLORS.gray} />
              <View style={[styles.paymentStatusBadge, getPaymentStatusStyle(currentBooking.paymentStatus)]}>
                <Text style={styles.paymentStatusText}>
                  {currentBooking.paymentStatus.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {currentBooking.status === 'confirmed' && (
          <View style={[styles.card, styles.serviceCard]}>
            <Text style={styles.sectionTitle}>Request Services</Text>
            <View style={styles.serviceButtons}>
              <TouchableOpacity
                style={styles.serviceButton}
                onPress={() => handleServiceRequest('housekeeping')}
              >
                <View style={styles.serviceIconContainer}>
                  <Ionicons name="bed-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.serviceButtonText}>Housekeeping</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceButton}
                onPress={() => handleServiceRequest('maintenance')}
              >
                <View style={styles.serviceIconContainer}>
                  <Ionicons name="construct-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.serviceButtonText}>Maintenance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceButton}
                onPress={() => handleServiceRequest('roomService')}
              >
                <View style={styles.serviceIconContainer}>
                  <Ionicons name="restaurant-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.serviceButtonText}>Room Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          {currentBooking.paymentStatus === 'completed' && (
            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={handleDownloadReceipt}
            >
              <Ionicons name="download-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Download Receipt</Text>
            </TouchableOpacity>
          )}

          {(currentBooking.status === 'pending' || currentBooking.status === 'confirmed') && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelBooking}
            >
              <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
    marginLeft: SPACING.md,
  },
  content: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  statusText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  dateSection: {
    marginBottom: SPACING.lg,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.grayLight,
    marginHorizontal: SPACING.md,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  dateValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
  },
  infoSection: {
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  paymentStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  serviceCard: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  serviceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  serviceButton: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  serviceButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  actionButtons: {
    gap: SPACING.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.xs,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
  },
}); 