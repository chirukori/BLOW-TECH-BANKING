import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import api from '../services/api';

export default function RequestMoneyScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [amount, setAmount] = useState('0.00');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Transfer');
  const [loading, setLoading] = useState(false);

  const quickAmounts = ['100', '250', '500', '1000'];
  const categories = ['Transfer', 'Food', 'Shopping', 'Bills', 'Entertainment', 'Transport'];

  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
  };

  const handleRequest = async () => {
    const numAmount = parseFloat(amount);
    if (!recipient) {
      Alert.alert('Error', 'Please enter a recipient email.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      await api.post('/transactions/request', {
        recipient: recipient.trim(),
        amount: numAmount,
        note: note || 'Request',
        category: category
      }, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      Alert.alert('Success', `Successfully requested ₹${numAmount} from ${recipient}`);
      setAmount('0.00');
      setRecipient('');
      setNote('');
      navigation.navigate('Main'); 
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        Alert.alert('Error', 'Request timed out. Check the backend connection (Windows Firewall).');
      } else {
        Alert.alert('Error', err.response?.data?.error || 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Money</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Amount Section */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Request Amount</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#374151"
            />
          </View>
        </View>

        {/* Quick Amounts */}
        <View style={styles.quickAmountsRow}>
          {quickAmounts.map((amt) => (
            <TouchableOpacity 
              key={amt} 
              style={styles.quickAmountBtn}
              onPress={() => setAmount(amt)}
            >
              <Text style={styles.quickAmountText}>₹{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Request From / Email</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. jane@example.com"
            placeholderTextColor="#4b5563"
            value={recipient}
            onChangeText={setRecipient}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="What's this for?"
            placeholderTextColor="#4b5563"
            value={note}
            onChangeText={setNote}
          />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.sendBtn, loading && styles.sendBtnDisabled]} 
          onPress={handleRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Request Money</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  amountCard: { backgroundColor: '#111827', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#1f2937' },
  amountLabel: { color: '#9ca3af', fontSize: 14, marginBottom: 12 },
  amountInputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currencySymbol: { color: '#4b5563', fontSize: 40, fontWeight: '700', marginRight: 8 },
  amountInput: { color: '#fff', fontSize: 48, fontWeight: '700', minWidth: 100, textAlign: 'center' },

  quickAmountsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickAmountBtn: { flex: 1, backgroundColor: '#1f2937', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  quickAmountText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  inputGroup: { marginBottom: 20 },
  label: { color: '#9ca3af', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: '#111827', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#1f2937' },

  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32, marginTop: 8 },
  categoryChip: { backgroundColor: '#1f2937', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  categoryChipActive: { backgroundColor: '#10b981' }, 
  categoryText: { color: '#9ca3af', fontWeight: '500' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },

  sendBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  sendBtnDisabled: { opacity: 0.7 },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
