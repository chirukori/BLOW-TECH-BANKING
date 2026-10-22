import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Platform } from 'react-native';
import { ArrowLeft, Bell, DollarSign, ShieldCheck, PiggyBank } from 'lucide-react-native';
import api from '../services/api';

export default function NotificationsScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await api.get(`/notifications/${user._id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/${user._id}/read`);
      await fetchData();
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const getIconData = (title) => {
    const t = title.toLowerCase();
    if (t.includes('received') || t.includes('deposited') || t.includes('payment')) return { icon: DollarSign, bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    if (t.includes('security') || t.includes('login')) return { icon: ShieldCheck, bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    if (t.includes('budget') || t.includes('alert')) return { icon: Bell, bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    if (t.includes('savings') || t.includes('tip')) return { icon: PiggyBank, bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
    return { icon: Bell, bg: '#1f2937', color: '#9ca3af' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>You have no notifications.</Text>
        ) : (
          notifications.map((notif) => {
            const { icon: Icon, bg, color } = getIconData(notif.title);
            return (
              <View key={notif._id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                    <Icon size={20} color={color} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{notif.title}</Text>
                    <Text style={styles.message}>{notif.message}</Text>
                    <Text style={styles.time}>{formatDate(notif.createdAt)}</Text>
                  </View>
                </View>
                {!notif.isRead && <View style={styles.unreadDot} />}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  markReadText: { color: '#3b82f6', fontSize: 14, fontWeight: '500' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },

  card: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderWidth: 1, borderColor: '#1f2937' },
  cardContent: { flexDirection: 'row', flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  message: { color: '#9ca3af', fontSize: 14, marginBottom: 8, lineHeight: 20 },
  time: { color: '#6b7280', fontSize: 12 },
  
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6', marginTop: 8 },

  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 40 }
});
