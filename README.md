<!-- # eHotelManager Mobile App

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
git clone [repository-url]
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
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

## Security Notes

- Never commit `.env` files
- Keep Firebase configuration secure
- Follow Firebase security rules
- Protect API keys and sensitive data

## License

This project is licensed under the MIT License  -->