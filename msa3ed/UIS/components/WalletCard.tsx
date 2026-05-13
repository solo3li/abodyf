import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface WalletCardProps {
    balance: number;
    currency?: string;
    style?: ViewStyle;
}

export default function WalletCard({ balance, currency = 'ج.م', style }: WalletCardProps) {
    const router = useRouter();

    return (
        <Pressable 
            style={[styles.card, style]} 
            onPress={() => router.push('/student/(drawer)/wallet' as any)}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="wallet" size={24} color={Colors.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.label}>رصيد المحفظة</Text>
                    <Text style={styles.balance}>{balance.toFixed(2)} {currency}</Text>
                </View>
                <View style={styles.actionContainer}>
                    <Ionicons name="add-circle" size={28} color={Colors.primary} />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        boxShadow: [{ color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blurRadius: 12, spreadDistance: 0 }],
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontFamily: 'Tajawal-Medium',
        marginBottom: 2,
    },
    balance: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        fontFamily: 'Tajawal-Bold',
    },
    actionContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
