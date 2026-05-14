import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { fetchWallet, requestDeposit, requestWithdrawal, clearWalletError } from '../../../../store/slices/walletSlice';
import * as ImagePicker from 'expo-image-picker';

export default function WalletScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { balance, currency, transactions, loading, error } = useSelector((state: RootState) => state.wallet);
    const { user } = useSelector((state: RootState) => state.auth);
    
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState<'Deposit' | 'Withdraw'>('Deposit');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchWallet());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            Alert.alert('خطأ', error);
            dispatch(clearWalletError());
        }
    }, [error, dispatch]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setScreenshot(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            Alert.alert('خطأ', 'الرجاء إدخال مبلغ صحيح');
            return;
        }

        if (!screenshot) {
            Alert.alert('تنبيه', mode === 'Deposit' ? 'الرجاء إرفاق صورة إثبات الدفع' : 'الرجاء إرفاق صورة توضح رقم المحفظة أو الطلب');
            return;
        }

        setIsSubmitting(true);
        let result;
        if (mode === 'Deposit') {
            result = await dispatch(requestDeposit({ amount: val, screenshot }));
        } else {
            result = await dispatch(requestWithdrawal({ amount: val, screenshot }));
        }
        setIsSubmitting(false);

        if (requestDeposit.fulfilled.match(result) || requestWithdrawal.fulfilled.match(result)) {
            Alert.alert('نجاح', 'تم إرسال طلبك بنجاح وهو قيد المراجعة حالياً');
            setAmount('');
            setScreenshot(null);
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

                        <View style={styles.modeTabs}>
                            <TouchableOpacity 
                                style={[styles.modeTab, mode === 'Deposit' && styles.activeModeTab]} 
                                onPress={() => { setMode('Deposit'); setScreenshot(null); }}
                            >
                                <Text style={[styles.modeTabText, mode === 'Deposit' && styles.activeModeTabText]}>شحن رصيد</Text>
                            </TouchableOpacity>
                            {user?.isExecutor && (
                                <TouchableOpacity 
                                    style={[styles.modeTab, mode === 'Withdraw' && styles.activeModeTab]} 
                                    onPress={() => { setMode('Withdraw'); setScreenshot(null); }}
                                >
                                    <Text style={[styles.modeTabText, mode === 'Withdraw' && styles.activeModeTabText]}>سحب أرباح</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.requestSection}>
                            <Text style={styles.sectionTitle}>{mode === 'Deposit' ? 'طلب شحن محفظة' : 'طلب سحب رصيد'}</Text>
                            
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="المبلغ..."
                                value={amount}
                                onChangeText={setAmount}
                            />

                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {screenshot ? (
                                    <Image source={{ uri: screenshot }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.pickerPlaceholder}>
                                        <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
                                        <Text style={styles.pickerText}>
                                            {mode === 'Deposit' ? 'ارفق صورة إثبات الدفع' : 'ارفق صورة رقم المحفظة'}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.submitButton, (!amount || !screenshot || isSubmitting) && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={!amount || !screenshot || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>إرسال الطلب</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.transactionsSection}>
                            <Text style={styles.sectionTitle}>آخر المعاملات</Text>
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
        padding: 25,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 5, fontFamily: 'Tajawal-Medium' },
    balanceValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', fontFamily: 'Tajawal-Bold' },
    modeTabs: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 5,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: Colors.border
    },
    modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    activeModeTab: { backgroundColor: Colors.primary },
    modeTabText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Tajawal-Bold' },
    activeModeTabText: { color: '#fff' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 15, fontFamily: 'Tajawal-Bold', textAlign: 'left' },
    requestSection: { marginBottom: 35 },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        fontFamily: 'Tajawal-Medium',
        textAlign: 'right'
    },
    imagePicker: {
        height: 180,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden'
    },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    pickerPlaceholder: { alignItems: 'center' },
    pickerText: { color: Colors.textSecondary, fontSize: 14, marginTop: 10, fontFamily: 'Tajawal-Medium' },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    submitButtonDisabled: { backgroundColor: Colors.border },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Tajawal-Bold' },
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
