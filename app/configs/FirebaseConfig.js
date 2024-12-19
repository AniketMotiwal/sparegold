import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZwbcDYJJBJeYip8bGjh8KXQa_mmGVQHM",
  authDomain: "sparegold.firebaseapp.com",
  projectId: "sparegold",
  storageBucket: "sparegold.firebasestorage.app",
  messagingSenderId: "14225243392",
  appId: "1:14225243392:web:d312f711fd83e89e3a07e5",
  measurementId: "G-JG3933MXMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Named exports
export { app, auth };

// Default export (optional, for convenience)
export default { app, auth };
