import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface SearchBarProps {
  onSearch: (text: string) => void;
  value?: string;
}

export default function SearchBar({ onSearch, value }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="ابحث عن خدمة..."
        placeholderTextColor={Colors.textSecondary}
        onChangeText={onSearch}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginVertical: 16,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
});
