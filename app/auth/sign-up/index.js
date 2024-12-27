import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../../configs/FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons'; // Importing MaterialIcons for the eye icon

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onCreateAccount = () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        // After creating the account, sign the user in automatically
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then(() => {
        setLoading(false);
        setShowSuccess(true);
        animateSuccessMessage();

        // Wait for the success message to fade out, then navigate
        setTimeout(() => {
          setShowSuccess(false);
          router.push('auth/sign-in'); // Redirect to sign-in page after success
        }, 3000); // Give the success message 3 seconds to show
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert('Error', error.message);
      });
  };

  const animateSuccessMessage = () => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Fully visible
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0, // Fully hidden
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2000); // Wait for 2 seconds before fading out
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create an Account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            secureTextEntry={!showPassword} // Toggle password visibility
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="#555"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={onCreateAccount}
        disabled={loading}
      >
        <Text style={styles.createAccountButtonText}>
          {loading ? 'Creating...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      {showSuccess && (
        <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
          <Text style={styles.successMessageText}>
            Account created successfully!
          </Text>
        </Animated.View>
      )}

      <Text style={styles.alreadyText}>Already have an account?</Text>
      <TouchableOpacity
        style={styles.signInButton}
        onPress={() => router.push('auth/sign-in')}
      >
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 10,
  },
  createAccountButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alreadyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginTop: 20,
  },
  signInButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successMessage: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  successMessageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
