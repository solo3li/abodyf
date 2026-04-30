import React from 'react';
import { Pressable, Text, StyleSheet, PressableProps, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({ title, loading, icon, variant = 'primary', style, textStyle, ...props }: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.96);
    opacity.value = withTiming(0.8, { duration: 100 });
    props.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 100 });
    props.onPressOut?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: props.disabled ? 0.6 : opacity.value,
  }));

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.white : Colors.primary} />
      ) : (
        <>
          <Text style={[styles.text, !isPrimary && styles.textOutline, textStyle]}>
            {title}
          </Text>
          {icon && <Ionicons name={icon} size={20} color={isPrimary ? Colors.white : Colors.primary} style={styles.icon} />}
        </>
      )}
    </>
  );

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, isOutline && styles.containerOutline, variant === 'ghost' && styles.containerGhost, style, animatedStyle]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: [{ color: 'rgba(99, 102, 241, 0.3)', offsetX: 0, offsetY: 8, blurRadius: 15, spreadDistance: 0 }],
    elevation: 4,
  },
  containerOutline: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.transparent,
    boxShadow: [],
    elevation: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  containerGhost: {
    backgroundColor: Colors.transparent,
    boxShadow: [],
    elevation: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  textOutline: {
    color: Colors.primary,
  },
  icon: {
    marginLeft: 8,
  },
});
