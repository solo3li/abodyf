import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { fetchWallet, topUpWallet, clearWalletError } from '../../../../store/slices/walletSlice';

export default function WalletScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { balance, currency, transactions, loading, error } = useSelector((state: RootState) => state.wallet);
    
    const [amount, setAmount] = useState('');
    const [isToppingUp, setIsToppingUp] = useState(false);

    useEffect(() => {
        dispatch(fetchWallet());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            Alert.alert('خطأ', error);
            dispatch(clearWalletError());
        }
    }, [error, dispatch]);

    const handleTopUp = async () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            Alert.alert('خطأ', 'الرجاء إدخال مبلغ صحيح');
            return;
        }

        setIsToppingUp(true);
        const result = await dispatch(topUpWallet(val));
        setIsToppingUp(false);

        if (topUpWallet.fulfilled.match(result)) {
            Alert.alert('نجاح', 'تم الشحن بنجاح');
            setAmount('');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>المحفظة المالية</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading && transactions.length === 0 ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <View style={styles.balanceCard}>
                            <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
                            <Text style={styles.balanceValue}>{balance.toFixed(2)} {currency}</Text>
                        </View>

                        <View style={styles.topUpSection}>
                            <Text style={styles.sectionTitle}>شحن المحفظة</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="أدخل المبلغ..."
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                                <TouchableOpacity 
                                    style={[styles.topUpButton, (!amount || isToppingUp) && styles.topUpButtonDisabled]}
                                    onPress={handleTopUp}
                                    disabled={!amount || isToppingUp}
                                >
                                    {isToppingUp ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.topUpButtonText}>شحن</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.transactionsSection}>
                            <Text style={styles.sectionTitle}>سجل المعاملات</Text>
                            {transactions.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="receipt-outline" size={48} color={Colors.textSecondary} />
                                    <Text style={styles.emptyText}>لا توجد معاملات سابقة</Text>
                                </View>
                            ) : (
                                transactions.map((t) => (
                                    <View key={t.id} style={styles.transactionCard}>
                                        <View style={styles.txIconContainer}>
                                            <Ionicons 
                                                name={t.amount >= 0 ? "arrow-down" : "arrow-up"} 
                                                size={20} 
                                                color={t.amount >= 0 ? Colors.success : Colors.error} 
                                            />
                                        </View>
                                        <View style={styles.txDetails}>
                                            <Text style={styles.txDescription}>{t.description}</Text>
                                            <Text style={styles.txDate}>{new Date(t.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                                        </View>
                                        <Text style={[styles.txAmount, { color: t.amount >= 0 ? Colors.success : Colors.error }]}>
                                            {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} {currency}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, fontFamily: 'Tajawal-Bold' },
    content: { padding: 20, paddingBottom: 100 },
    balanceCard: {
        backgroundColor: Colors.primary,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 10, fontFamily: 'Tajawal-Medium' },
    balanceValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', fontFamily: 'Tajawal-Bold' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 15, fontFamily: 'Tajawal-Bold', textAlign: 'left' },
    topUpSection: { marginBottom: 30 },
    inputContainer: { flexDirection: 'row', alignItems: 'center' },
    input: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginRight: 10,
        fontFamily: 'Tajawal-Medium',
        textAlign: 'right'
    },
    topUpButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topUpButtonDisabled: { backgroundColor: Colors.border },
    topUpButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Tajawal-Bold' },
    transactionsSection: { flex: 1 },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 15,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    txIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    txDetails: { flex: 1, alignItems: 'flex-start' },
    txDescription: { fontSize: 15, color: Colors.text, fontWeight: '600', fontFamily: 'Tajawal-Medium', marginBottom: 4 },
    txDate: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Tajawal-Regular' },
    txAmount: { fontSize: 16, fontWeight: '700', fontFamily: 'Tajawal-Bold' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 15, fontFamily: 'Tajawal-Medium' }
});
