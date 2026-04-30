import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  label?: string;
  error?: string;
}

export default function Input({ icon, rightIcon, onRightIconPress, label, error, style, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue(Colors.border);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withTiming(Colors.primary, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = withTiming(error ? Colors.error : Colors.border, { duration: 200 });
    onBlur?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: error ? Colors.error : borderColor.value,
    boxShadow: isFocused 
      ? [{ color: Colors.primary + '20', offsetX: 0, offsetY: 0, blurRadius: 10, spreadDistance: 2 }]
      : [{ color: 'rgba(0,0,0,0.02)', offsetX: 0, offsetY: 2, blurRadius: 5, spreadDistance: 0 }],
  }));

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.container, animatedStyle]}>
        {icon && <Ionicons name={icon} size={22} color={isFocused ? Colors.primary : Colors.textSecondary} style={styles.icon} />}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <Ionicons 
            name={rightIcon} 
            size={22} 
            color={Colors.textSecondary} 
            style={styles.rightIcon} 
            onPress={onRightIconPress} 
          />
        )}
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 60,
    borderWidth: 1.5,
    elevation: 1,
  },
  icon: {
    marginRight: 16,
  },
  rightIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
    height: '100%',
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
});
