import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK (optional for demo)
let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY !== 'your-private-key') {
    
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('⚠️  Firebase credentials not configured - running in demo mode');
  }
} catch (error) {
  console.log('⚠️  Firebase initialization failed - running in demo mode:', error.message);
}

export const auth = firebaseInitialized ? admin.auth() : null;
export const messaging = firebaseInitialized ? admin.messaging() : null;
export { firebaseInitialized };

export default admin;
