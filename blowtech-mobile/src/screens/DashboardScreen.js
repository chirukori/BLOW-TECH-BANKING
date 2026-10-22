import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView, Platform } from 'react-native';
import { Bell, Settings, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, QrCode, PieChart } from 'lucide-react-native';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import { formatCurrency } from '../utils/currency';

export default function DashboardScreen({ route, navigation }) {
  const { user } = route.params || {};
  const userId = user?._id;

  const [refreshing, setRefreshing] = useState(false);
  const [balanceData, setBalanceData] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [balanceRes, txRes, notifRes] = await Promise.all([
        api.get(`/account/${userId}/balance`),
        api.get(`/transactions/${userId}`),
        api.get(`/notifications/${userId}`)
      ]);
      setBalanceData(balanceRes.data);
      setTransactions(txRes.data);
      setNotifications(notifRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up a listener for when the tab comes into focus
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthlyTransactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = monthlyTransactions.filter(t => t.amount < 0).reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const QuickAction = ({ icon: Icon, label, onPress, color = "#fff", bgColor = "#3b82f6" }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: bgColor }]}>
        <Icon size={24} color={color} strokeWidth={2.5} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('AlertsTab')}>
              <Bell size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile', { user })}>
              <Settings size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card (Recreating Purple Gradient visually) */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.novaBadge}>
              <Text style={styles.novaText}>NOVA</Text>
            </View>
          </View>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {isBalanceHidden ? '••••••••' : formatCurrency(balanceData.balance)}
            </Text>
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
              {isBalanceHidden ? <EyeOff size={20} color="#e5e7eb" /> : <Eye size={20} color="#e5e7eb" />}
            </TouchableOpacity>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardHolder}>{user?.fullName || 'User'}</Text>
            <Text style={styles.cardNumber}>••••  9105</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickAction icon={ArrowUpRight} label="Send" bgColor="#3b82f6" onPress={() => navigation.navigate('SendTab')} />
          <QuickAction icon={ArrowDownLeft} label="Request" bgColor="#10b981" onPress={() => navigation.navigate('RequestMoney', { user })} />
          <QuickAction icon={QrCode} label="QR Pay" bgColor="#a855f7" onPress={() => navigation.navigate('QRTab')} />
          <QuickAction icon={PieChart} label="Budget" bgColor="#f59e0b" onPress={() => navigation.navigate('StatsTab')} />
        </View>

        {/* Income / Expenses Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTitleRow}>
              <ArrowUpRight size={16} color="#10b981" />
              <Text style={[styles.summaryTitle, {color: '#10b981'}]}>Income</Text>
            </View>
            <Text style={styles.summaryAmount}>{formatCurrency(income)}</Text>
            <Text style={styles.summarySub}>This month</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTitleRow}>
              <ArrowDownLeft size={16} color="#ef4444" />
              <Text style={[styles.summaryTitle, {color: '#ef4444'}]}>Expenses</Text>
            </View>
            <Text style={styles.summaryAmount}>{formatCurrency(expenses)}</Text>
            <Text style={styles.summarySub}>This month</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StatsTab')}>
              <Text style={styles.seeAll}>See all ></Text>
            </TouchableOpacity>
          </View>
          <TransactionList transactions={transactions.slice(0, 5)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  scrollContent: { paddingBottom: 100 }, // Space for bottom nav
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  greeting: { color: '#9ca3af', fontSize: 14, fontWeight: '400', marginBottom: 4 },
  userName: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { backgroundColor: '#1f2937', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  balanceCard: { marginHorizontal: 24, padding: 24, backgroundColor: '#7c3aed', borderRadius: 24, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  novaBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  novaText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  balanceAmount: { color: '#ffffff', fontSize: 36, fontWeight: '700', letterSpacing: -1 },
  eyeBtn: { marginLeft: 12, padding: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHolder: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  cardNumber: { color: 'rgba(255,255,255,0.8)', fontSize: 12, letterSpacing: 2 },

  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24, marginTop: 32 },
  actionItem: { alignItems: 'center', flex: 1 },
  actionIconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { color: '#e5e5e5', fontSize: 13, fontWeight: '500' },

  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24, marginTop: 32 },
  summaryCard: { flex: 1, backgroundColor: '#111827', borderRadius: 16, padding: 16, marginRight: 8, borderWidth: 1, borderColor: '#1f2937' },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryTitle: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  summaryAmount: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  summarySub: { color: '#6b7280', fontSize: 12 },

  transactionsSection: { padding: 24, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  seeAll: { color: '#3b82f6', fontSize: 14, fontWeight: '500' },
});
