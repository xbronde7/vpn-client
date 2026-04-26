import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../utils/constants';
import { VPNStatus } from '../types';

interface Props {
  status: VPNStatus;
  onPress: () => void;
  disabled?: boolean;
}

export default function ConnectionButton({ status, onPress, disabled }: Props) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (status === 'connecting' || status === 'disconnecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.95, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [status]);

  const getColors = () => {
    switch (status) {
      case 'connected': return { bg: COLORS.success, icon: 'power' as const, text: 'Отключить' };
      case 'connecting': return { bg: COLORS.warning, icon: 'sync' as const, text: 'Подключение...' };
      case 'disconnecting': return { bg: COLORS.warning, icon: 'sync' as const, text: 'Отключение...' };
      case 'error': return { bg: COLORS.error, icon: 'alert-circle' as const, text: 'Ошибка' };
      default: return { bg: COLORS.primary, icon: 'power' as const, text: 'Подключиться' };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || status === 'connecting' || status === 'disconnecting'} activeOpacity={0.8}>
      <Animated.View style={[styles.container, { backgroundColor: colors.bg, transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name={colors.icon} size={48} color={COLORS.white} />
        <Text style={styles.text}>{colors.text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
});
