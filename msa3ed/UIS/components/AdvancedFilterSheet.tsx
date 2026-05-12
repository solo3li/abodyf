import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Colors } from '../constants/Colors';
import Button from './Button';

interface AdvancedFilterSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  onApply: (filters: any) => void;
  onClose: () => void;
}

export default function AdvancedFilterSheet({ sheetRef, onApply, onClose }: AdvancedFilterSheetProps) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxDays, setMaxDays] = useState('');

  const handleApply = () => {
    onApply({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxDeliveryDays: maxDays ? parseInt(maxDays) : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxDays('');
    onApply({});
    onClose();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={['50%']}
      index={-1}
      enablePanDownToClose
      backgroundStyle={styles.bg}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>تصفية متقدمة</Text>
          <Pressable onPress={handleReset}><Text style={styles.resetText}>إعادة ضبط</Text></Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الحد الأقصى للسعر</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="ج.م" value={maxPrice} onChangeText={setMaxPrice} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الحد الأدنى للسعر</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="ج.م" value={minPrice} onChangeText={setMinPrice} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>مدة التنفيذ (حد أقصى)</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="أيام" value={maxDays} onChangeText={setMaxDays} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>التقييم (حد أدنى)</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="من 5" value={minRating} onChangeText={setMinRating} />
          </View>
        </View>

        <Button title="تطبيق الفلاتر" onPress={handleApply} style={styles.btn} />
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: Colors.white, borderRadius: 24, borderWidth: 1, borderColor: Colors.border },
  content: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  resetText: { fontSize: 14, color: Colors.error, fontWeight: '600' },
  row: { flexDirection: 'row-reverse', gap: 16, marginBottom: 16 },
  inputGroup: { flex: 1 },
  label: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, textAlign: 'right', color: Colors.text },
  btn: { marginTop: 24 }
});
