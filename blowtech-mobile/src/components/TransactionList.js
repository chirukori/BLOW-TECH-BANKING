import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Coffee, ArrowDownLeft, ArrowUpRight, ShoppingBag, Receipt, Film, Bus, CreditCard } from 'lucide-react-native';
import { formatCurrency } from '../utils/currency';

export default function TransactionList({ transactions, isScrollable = false }) {

  const getIconAndColor = (category, amount) => {
    const isIncome = amount > 0;
    
    // First check if it's income
    if (isIncome) return { icon: ArrowDownLeft, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };

    // Otherwise it's an expense, check category
    switch (category?.toLowerCase()) {
      case 'food':
      case 'food & drinks': 
        return { icon: Coffee, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' }; // Orange
      case 'shopping': 
        return { icon: ShoppingBag, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' };
      case 'bills': 
        return { icon: Receipt, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
      case 'entertainment': 
        return { icon: Film, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' };
      case 'transport': 
        return { icon: Bus, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' };
      case 'transfer': 
        return { icon: ArrowUpRight, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' };
      default: 
        return { icon: CreditCard, color: '#a1a1aa', bgColor: '#262626' };
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderItem = ({ item }) => {
    const isPositive = item.amount > 0;
    const { icon: Icon, color, bgColor } = getIconAndColor(item.category, item.amount);
    
    return (
      <View style={styles.transactionRow}>
        <View style={styles.leftSide}>
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.details}>
            <Text style={styles.merchant}>{item.merchant}</Text>
            <Text style={styles.category}>{item.category} · {formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.rightSide}>
          <Text style={[styles.amount, isPositive ? styles.positiveAmount : styles.negativeAmount]}>
            {isPositive ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
          </Text>
          <Text style={styles.status}>Completed</Text>
        </View>
      </View>
    );
  };

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No recent activity.</Text>
      </View>
    );
  }

  return (
    <View style={styles.containerWrapper}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id || item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={isScrollable} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  listContainer: {
    paddingBottom: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    justifyContent: 'center',
    flex: 1,
  },
  merchant: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    color: '#9ca3af',
    fontSize: 13,
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  positiveAmount: {
    color: '#10b981',
  },
  negativeAmount: {
    color: '#ffffff', // As per screenshot, negative amounts are white
  },
  status: {
    color: '#9ca3af',
    fontSize: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  }
});
