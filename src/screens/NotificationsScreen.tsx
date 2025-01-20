import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text, Card, IconButton, Badge } from 'react-native-paper';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../services/FirestoreService';

interface Notification {
  id: string;
  type: 'booking_status_update' | 'service_request_update' | 'new_service_request';
  message: string;
  createdAt: Date;
  read: boolean;
  bookingId?: string;
  requestId?: string;
  status?: string;
}

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (user) {
        const userNotifications = await getUserNotifications(user.uid);
        setNotifications(userNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state to mark notification as read
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_status_update':
        return '📅';
      case 'service_request_update':
        return '🔧';
      case 'new_service_request':
        return '✨';
      default:
        return '📌';
    }
  };

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
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          notifications
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((notification) => (
              <Card
                key={notification.id}
                style={[
                  styles.card,
                  !notification.read && styles.unreadCard
                ]}
                onPress={() => handleNotificationPress(notification.id)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>
                        {getNotificationIcon(notification.type)}
                      </Text>
                      {!notification.read && (
                        <Badge
                          size={8}
                          style={styles.unreadBadge}
                        />
                      )}
                    </View>
                    <Text style={styles.timestamp}>
                      {notification.createdAt.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.message}>{notification.message}</Text>
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
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: COLORS.background,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardContent: {
    padding: SPACING.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 0,
    right: -4,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
}); 