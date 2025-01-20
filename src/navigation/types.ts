export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Guest: undefined;
  Staff: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  StaffLogin: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  BookingsList: undefined;
  Profile: undefined;
  Notifications: undefined;
  RoomDetails: {
    roomId: string;
  };
  BookingForm: {
    roomId: string;
  };
  BookingDetails: {
    booking: {
      id: string;
      roomId: string;
      checkIn: Date;
      checkOut: Date;
      guestCount: number;
      guestName: string;
      email: string;
      phone: string;
      totalPrice: number;
      status: string;
      paymentStatus: string;
      receiptUrl?: string;
    };
  };
  Payment: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    numGuests: number;
    guestName: string;
    email: string;
    phone: string;
    totalPrice: number;
  };
};

export type GuestTabParamList = {
  Home: undefined;
  Search: undefined;
  Login: undefined;
};

export type StaffTabParamList = {
  Dashboard: undefined;
  Rooms: undefined;
  Bookings: undefined;
  Profile: undefined;
  ServiceRequests: undefined;
};

export type RoomStackParamList = {
  RoomList: undefined;
  RoomDetails: {
    roomId: string;
  };
  BookingForm: {
    roomId: string;
  };
  BookingDetails: {
    booking: {
      id: string;
      roomId: string;
      checkIn: Date;
      checkOut: Date;
      guestCount: number;
      guestName: string;
      email: string;
      phone: string;
      totalPrice: number;
      status: string;
      paymentStatus: string;
      receiptUrl?: string;
    };
  };
  Payment: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    numGuests: number;
    guestName: string;
    email: string;
    phone: string;
    totalPrice: number;
  };
};

export type StaffStackParamList = {
  StaffTabs: undefined;
  BookingDetails: {
    booking: {
      id: string;
      roomId: string;
      checkIn: Date;
      checkOut: Date;
      guestCount: number;
      guestName: string;
      email: string;
      phone: string;
      totalPrice: number;
      status: string;
      paymentStatus: string;
      receiptUrl?: string;
    };
  };
};

export type BookingsStackParamList = {
  BookingsList: undefined;
  BookingDetails: {
    booking: {
      id: string;
      roomId: string;
      checkIn: Date;
      checkOut: Date;
      guestCount: number;
      guestName: string;
      email: string;
      phone: string;
      totalPrice: number;
      status: string;
      paymentStatus: string;
      receiptUrl?: string;
    };
  };
}; 