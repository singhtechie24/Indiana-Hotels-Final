import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Badge } from 'react-native-paper';
import { 
  RootStackParamList, 
  MainTabParamList, 
  AuthStackParamList, 
  RoomStackParamList, 
  BookingsStackParamList,
  GuestTabParamList,
  StaffTabParamList,
  StaffStackParamList
} from './types';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { StaffLoginScreen } from '../screens/StaffLoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { RoomDetailsScreen } from '../screens/RoomDetailsScreen';
import { BookingFormScreen } from '../screens/BookingFormScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { PaymentScreen } from '../screens/PaymentScreen';
import { StaffDashboardScreen } from '../screens/StaffDashboardScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { BookingDetailsScreen } from '../screens/BookingDetailsScreen';
import { ServiceRequestsScreen } from '../screens/ServiceRequestsScreen';
import { StaffBookingsScreen } from '../screens/StaffBookingsScreen';
import { RoomManagementScreen } from '../screens/RoomManagementScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { getUnreadNotificationCount } from '../services/FirestoreService';

// Temporary placeholder screens for Bookings
const PlaceholderScreen = () => null;

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RoomStack = createNativeStackNavigator<RoomStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const GuestTab = createBottomTabNavigator<GuestTabParamList>();
const StaffTab = createBottomTabNavigator<StaffTabParamList>();

const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();

const StaffStack = createNativeStackNavigator<StaffStackParamList>();

interface TabBarIconProps {
  color: string;
}

const RoomNavigator = () => {
  return (
    <RoomStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RoomStack.Screen name="RoomList" component={SearchScreen} />
      <RoomStack.Screen name="RoomDetails" component={RoomDetailsScreen} />
      <RoomStack.Screen name="BookingForm" component={BookingFormScreen} />
      <RoomStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <RoomStack.Screen name="Payment" component={PaymentScreen} />
    </RoomStack.Navigator>
  );
};

// Guest mode navigation - limited functionality
const GuestNavigator = () => {
  return (
    <GuestTab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontFamily: TYPOGRAPHY.fontFamily.semiBold,
          fontSize: TYPOGRAPHY.fontSize.lg,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.background,
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <GuestTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <GuestTab.Screen
        name="Search"
        component={RoomNavigator}
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>🔍</Text>
          ),
        }}
      />
      <GuestTab.Screen
        name="Login"
        component={AuthNavigator}
        options={{
          title: 'Sign In',
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </GuestTab.Navigator>
  );
};

const BookingsNavigator = () => {
  return (
    <BookingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <BookingsStack.Screen name="BookingsList" component={BookingsScreen} />
      <BookingsStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    </BookingsStack.Navigator>
  );
};

const MainNavigator = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const count = await getUnreadNotificationCount(user.uid);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    // Set up a refresh interval
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.background,
          backgroundColor: COLORS.white,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={RoomNavigator}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsNavigator}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <View>
              <Text style={{ color, fontSize: 24 }}>🔔</Text>
              {unreadCount > 0 && (
                <Badge
                  visible={true}
                  size={16}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: COLORS.error,
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="StaffLogin" component={StaffLoginScreen} />
    </AuthStack.Navigator>
  );
};

const StaffNavigator = () => {
  return (
    <StaffStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <StaffStack.Screen name="StaffTabs" component={StaffTabNavigator} />
      <StaffStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    </StaffStack.Navigator>
  );
};

const StaffTabNavigator = () => {
  return (
    <StaffTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <StaffTab.Screen
        name="Dashboard"
        component={StaffDashboardScreen}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <StaffTab.Screen
        name="Rooms"
        component={RoomManagementScreen}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>🛏️</Text>
          ),
        }}
      />
      <StaffTab.Screen
        name="Bookings"
        component={StaffBookingsScreen}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>📅</Text>
          ),
        }}
      />
      <StaffTab.Screen
        name="ServiceRequests"
        component={ServiceRequestsScreen}
        options={{
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <Text style={{ color, fontSize: 24 }}>🔧</Text>
          ),
        }}
      />
    </StaffTab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {loading ? (
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{ gestureEnabled: false }}
          />
        ) : user ? (
          user.role === 'staff' || user.role === 'admin' ? (
            <Stack.Screen name="Staff" component={StaffNavigator} />
          ) : (
            <Stack.Screen name="Main" component={MainNavigator} />
          )
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="Guest" component={GuestNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 