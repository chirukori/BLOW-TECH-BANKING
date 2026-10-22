import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { ArrowLeft, User, Mail, Shield, Bell, LogOut, ChevronRight, Hash, Calendar } from 'lucide-react-native';
import * as SecureStore from '../utils/storage';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/account/profile');
      setUserProfile(res.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation, fetchProfile]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    // Using replace or reset would be better, but navigating to Auth usually works if stack allows
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const MenuItem = ({ icon: Icon, label, onPress, color = '#fff', danger = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, danger && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <Icon size={20} color={danger ? '#ef4444' : '#a855f7'} />
        </View>
        <Text style={[styles.menuLabel, danger && { color: '#ef4444' }]}>{label}</Text>
      </View>
      <ChevronRight size={20} color="#4b5563" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(userProfile?.fullName)}</Text>
            </View>
            <Text style={styles.userName}>{userProfile?.fullName}</Text>
            <Text style={styles.userEmail}>{userProfile?.email}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Hash size={16} color="#9ca3af" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Account Number:</Text>
              <Text style={styles.infoValue}>{userProfile?._id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#9ca3af" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>{formatDate(userProfile?.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <MenuItem 
              icon={User} 
              label="Edit Profile" 
              onPress={() => navigation.navigate('EditProfile', { user: userProfile })} 
            />
            <MenuItem 
              icon={Shield} 
              label="Change Password" 
              onPress={() => navigation.navigate('ChangePassword')} 
            />
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <MenuItem 
              icon={Bell} 
              label="Notification Settings" 
              onPress={() => {}} 
            />
          </View>

          <View style={[styles.menuSection, { borderBottomWidth: 0 }]}>
            <MenuItem 
              icon={LogOut} 
              label="Log Out" 
              danger 
              onPress={handleLogout} 
            />
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  profileCard: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  userEmail: { color: '#9ca3af', fontSize: 14 },

  infoSection: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#1f2937' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  infoIcon: { marginRight: 8 },
  infoLabel: { color: '#9ca3af', fontSize: 14, width: 120 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 },

  menuSection: { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1f2937', paddingBottom: 16 },
  sectionTitle: { color: '#6b7280', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(168, 85, 247, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuLabel: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
