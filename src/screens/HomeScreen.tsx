import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

const ServiceCard = ({ icon, title }: { icon: string; title: string }) => (
  <View style={styles.serviceCard}>
    <View style={styles.serviceIconContainer}>
      <Text style={styles.serviceIcon}>{icon}</Text>
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
  </View>
);

const FeaturedRoomCard = ({ image, title, price }: { image: string; title: string; price: string }) => (
  <TouchableOpacity style={styles.roomCard}>
    <ImageBackground
      source={{ uri: image }}
      style={styles.roomImage}
      imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.roomGradient}
      >
        <View style={styles.roomInfo}>
          <Text style={styles.roomTitle}>{title}</Text>
          <Text style={styles.roomPrice}>{price}/night</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  </TouchableOpacity>
);

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const services = [
    { icon: '🏊‍♂️', title: 'Pool' },
    { icon: '🍽️', title: 'Restaurant' },
    { icon: '💆‍♂️', title: 'Spa' },
    { icon: '🏋️‍♂️', title: 'Gym' },
  ];

  const featuredRooms = [
    {
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3',
      title: 'Deluxe Ocean View',
      price: '$299',
    },
    {
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3',
      title: 'Premium Suite',
      price: '$499',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.hotelName}>Luxury Hotel</Text>
        <Text style={styles.welcomeText}>Welcome to your perfect stay</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        >
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Rooms</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.featuredRoomsContainer}>
          {featuredRooms.map((room, index) => (
            <FeaturedRoomCard key={index} {...room} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  hotelName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  welcomeText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  section: {
    padding: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  servicesContainer: {
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  serviceCard: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  seeAllButton: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
  },
  featuredRoomsContainer: {
    gap: SPACING.md,
  },
  roomCard: {
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  roomTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
  roomPrice: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
}); 