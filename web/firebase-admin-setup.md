# Firebase Admin Setup Guide

To enable Firebase Admin authentication for your API routes, follow these steps:

## 1. Generate a Firebase Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "ashcoin-51786"
3. Go to Project Settings > Service accounts
4. Click "Generate new private key"
5. Save the JSON file securely (never commit it to your repository)

## 2. Set Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=ashcoin-51786
FIREBASE_CLIENT_EMAIL=your-service-account-email@example.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Database
DATABASE_URL="postgresql://ai_agent:your_password@localhost:5432/ai_agent?schema=public"
```

Make sure to replace the placeholder values with your actual Firebase service account details.

## 3. Security Best Practices

- Never commit your `.env.local` file or service account key to version control
- Set up proper Firebase Security Rules to restrict access to your Firebase resources
- Consider using environment variable encryption for production deployments
- Rotate your service account keys periodically

## 4. Testing Authentication

Once your environment variables are set up, the API routes will authenticate requests using Firebase ID tokens. The client will:

1. Obtain an ID token from Firebase Authentication
2. Include it in the Authorization header of API requests
3. The server will verify the token and extract the user ID

This ensures that users can only access their own data and prevents unauthorized access to your API endpoints.
