# eHotelManager Mobile App

A React Native mobile application for hotel management, built with Expo and Firebase.

## Features

- User authentication and profile management
- Room browsing and booking
- Service requests and notifications
- Payment processing with Stripe
- Booking management
- Custom splash screen

## Tech Stack

- React Native
- Expo
- Firebase (Firestore, Authentication, Storage)
- TypeScript
- Stripe for payments

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/singhtechie24/Indiana-Hotels-Final.git
cd eHotelManager
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
- Copy `.env.example` to `.env`
- Fill in your Firebase configuration
- Add your Stripe API keys

4. Start the development server
```bash
npm start
```

## Environment Variables

Create a `.env` file with the following:
```
FIREBASE_API_KEY=<your-api-key>
FIREBASE_AUTH_DOMAIN=<your-auth-domain>
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
FIREBASE_MESSAGING_SENDER_ID=<your-messaging-sender-id>
FIREBASE_APP_ID=<your-app-id>
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

## Security Notes

- Never commit `.env` files
- Keep Firebase configuration secure
- Follow Firebase security rules
- Protect API keys and sensitive data

## License

This project is licensed under the MIT License 