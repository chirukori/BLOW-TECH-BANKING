import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import api from '../services/api';

export default function SendMoneyScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [amount, setAmount] = useState('0.00');
  const [recipient, setRecipient] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Transfer');
  const [loading, setLoading] = useState(false);

  const quickAmounts = ['100', '250', '500', '1000'];
  const categories = ['Transfer', 'Food', 'Shopping', 'Bills', 'Entertainment', 'Transport'];

  const handleAmountChange = (text) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
  };

  const handleSend = async () => {
    console.log('[1] Send button pressed');
    if (loading) return;
    
    const numAmount = parseFloat(amount);
    if (!recipient) {
      Alert.alert('Error', 'Please enter a recipient email.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    
    console.log('[2] Form validation passed');
    
    try {
      setLoading(true);
      console.log(`[3] API URL: ${api.defaults.baseURL}/transactions/send`);
      console.log('[4] Request about to be sent');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await api.post('/transactions/send', {
        recipient: recipient.trim(),
        amount: numAmount,
        note: note || 'Transfer',
        category: category
      }, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log('[5] Response received');
      console.log('[6] Response status:', response.status);
      console.log('[7] Response body:', JSON.stringify(response.data));
      
      Alert.alert('Success', `Successfully sent ₹${numAmount} to ${recipient}`);
      setAmount('0.00');
      setRecipient('');
      setNote('');
      
      navigation.navigate('HomeTab'); 
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        Alert.alert('Error', 'Request timed out. Check the backend connection.');
      } else {
        const errorMsg = err.response?.data?.error || err.message || 'Transaction failed. Please check your network and try again.';
        Alert.alert('Error', errorMsg);
      }
    } finally {
      console.log('[8] Loading finished');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 40 }} /> {/* Placeholder for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Amount Section */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Enter Amount</Text>
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
          <Text style={styles.label}>Recipient Name / Email</Text>
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
          <Text style={styles.label}>Account Number (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0000 0000 0000"
            placeholderTextColor="#4b5563"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
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
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Send Payment</Text>
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
  categoryChipActive: { backgroundColor: '#7c3aed' },
  categoryText: { color: '#9ca3af', fontWeight: '500' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },

  sendBtn: { backgroundColor: '#7c3aed', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  sendBtnDisabled: { opacity: 0.7 },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
