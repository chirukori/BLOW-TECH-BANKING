import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Platform } from 'react-native';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';

export default function AnalyticsScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [categoryData, setCategoryData] = useState([]);

  const categoryColors = {
    'Food': '#f59e0b',
    'Food & Drinks': '#f59e0b',
    'Transfer': '#8b5cf6',
    'Shopping': '#3b82f6',
    'Bills': '#ef4444',
    'Entertainment': '#ec4899',
    'Transport': '#6366f1'
  };

  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await api.get(`/transactions/${user._id}`);
      const txs = res.data;
      setTransactions(txs);

      let spent = 0;
      let received = 0;
      const catTotals = {};

      txs.forEach(t => {
        if (t.amount > 0) {
          received += t.amount;
        } else {
          const absAmount = Math.abs(t.amount);
          spent += absAmount;
          const cat = t.category || 'Other';
          catTotals[cat] = (catTotals[cat] || 0) + absAmount;
        }
      });

      setTotalSpent(spent);
      setTotalReceived(received);

      // Convert category totals to array for chart
      const chartData = Object.keys(catTotals).map(key => ({
        name: key,
        amount: catTotals[key],
        color: categoryColors[key] || '#9ca3af'
      })).sort((a, b) => b.amount - a.amount);

      setCategoryData(chartData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
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


  // SVG Arc Generator
  const createArc = (x, y, radius, startAngle, endAngle) => {
    const polarToCartesian = (centerX, centerY, rad, angleInDegrees) => {
      var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (rad * Math.cos(angleInRadians)),
        y: centerY + (rad * Math.sin(angleInRadians))
      };
    };

    // If it's a full circle, we need two arcs
    if (endAngle - startAngle === 360) {
      endAngle -= 0.01;
    }

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const renderDonutChart = () => {
    if (categoryData.length === 0) return null;

    let cumulativeAngle = 0;
    const arcs = categoryData.map((cat, i) => {
      const angle = (cat.amount / totalSpent) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      return (
        <Path 
          key={i}
          d={createArc(100, 100, 70, startAngle, endAngle)}
          stroke={cat.color}
          strokeWidth={30}
          fill="none"
        />
      );
    });

    return (
      <View style={styles.chartContainer}>
        <Svg width="200" height="200">
          <G>{arcs}</G>
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.spentCard]}>
            <TrendingDown size={20} color="#ef4444" style={styles.cardIcon} />
            <Text style={styles.summaryAmount}>{formatCurrency(totalSpent)}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
          <View style={[styles.summaryCard, styles.receivedCard]}>
            <TrendingUp size={20} color="#10b981" style={styles.cardIcon} />
            <Text style={styles.summaryAmount}>{formatCurrency(totalReceived)}</Text>
            <Text style={styles.summaryLabel}>Total Received</Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          
          {totalSpent > 0 ? (
            <>
              {renderDonutChart()}
              
              <View style={styles.legendContainer}>
                {categoryData.map((cat, i) => (
                  <View key={i} style={styles.legendRow}>
                    <Text style={styles.legendName}>{cat.name}</Text>
                    <Text style={styles.legendAmount}>{formatCurrency(cat.amount)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No spending data available yet.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  scrollContent: { padding: 24, paddingBottom: 100 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  summaryCard: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 1 },
  spentCard: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', marginRight: 8 },
  receivedCard: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', marginLeft: 8 },
  cardIcon: { marginBottom: 12 },
  summaryAmount: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  summaryLabel: { color: '#9ca3af', fontSize: 13 },

  chartSection: { backgroundColor: '#111827', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#1f2937' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 24 },
  
  chartContainer: { alignItems: 'center', marginBottom: 32 },

  legendContainer: { marginTop: 16 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  legendName: { color: '#d1d5db', fontSize: 14 },
  legendAmount: { color: '#fff', fontSize: 14, fontWeight: '600' },

  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 24, marginBottom: 24 }
});
