import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import * as SecureStore from '../utils/storage';
import api from '../services/api';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password || (!isLogin && !fullName)) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { email, password, fullName };
      
      const response = await api.post(endpoint, payload);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response body:`, response.data);

      if (response.status === 200 || response.status === 201) {
        if (response.data.token) {
          await SecureStore.setItemAsync('userToken', response.data.token);
        }

        if (!isLogin) {
          setSuccessMessage('Account created successfully. Logging you in...');
          setTimeout(() => {
            navigation.replace('Main', { user: response.data.user });
          }, 1500);
        } else {
          navigation.replace('Main', { user: response.data.user });
        }
      }
    } catch (error) {
      if (error.response) {
        console.log(`Error status: ${error.response.status}`);
        console.log(`Error body:`, error.response.data);
        setErrorMessage(error.response.data?.error || 'Server error occurred');
      } else if (error.request) {
        console.log('Error request (no response):', error.message);
        setErrorMessage('Could not connect to the server. Check your connection or IP address.');
      } else {
        console.log('Error setup:', error.message);
        setErrorMessage(error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.logoText}>blowtech</Text>
        <Text style={styles.subLogoText}>DIGITAL BANKING</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>{isLogin ? 'Sign In' : 'Create an account'}</Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Register'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleLink}>{isLogin ? 'Register' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  subLogoText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#171717',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444', // red-500
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  successText: {
    color: '#10b981', // emerald-500
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d4d4d8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  toggleLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
});
