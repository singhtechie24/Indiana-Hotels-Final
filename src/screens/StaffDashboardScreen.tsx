import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StaffTabParamList } from '../navigation/types';

type StaffDashboardNavigationProp = NativeStackNavigationProp<StaffTabParamList>;

export const StaffDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<StaffDashboardNavigationProp>();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.displayName}</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title
            title="Room Management"
            subtitle="View and manage hotel rooms"
          />
          <Card.Content>
            <Text>Quick access to room status and management</Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('Rooms')}
            >
              View Rooms
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Bookings"
            subtitle="Manage guest reservations"
          />
          <Card.Content>
            <Text>Handle check-ins, check-outs, and booking requests</Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('Bookings')}
            >
              View Bookings
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Service Requests"
            subtitle="Handle guest requests"
          />
          <Card.Content>
            <Text>Manage housekeeping and maintenance requests</Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('ServiceRequests')}
            >
              View Requests
            </Button>
          </Card.Actions>
        </Card>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
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
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.white,
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 20,
  },
}); 