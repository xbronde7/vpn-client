import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServerConfig } from '../types';
import { COLORS, FONTS, SPACING } from '../utils/constants';

interface Props {
  config: ServerConfig;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const protocolIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  vmess: 'globe',
  vless: 'flash',
  shadowsocks: 'eye-off',
  trojan: 'lock-closed',
};

const protocolColors: Record<string, string> = {
  vmess: COLORS.info,
  vless: COLORS.primaryLight,
  shadowsocks: COLORS.accent,
  trojan: COLORS.success,
};

export default function ConfigCard({ config, isSelected, onSelect, onEdit, onDelete }: Props) {
  const isReality = config.security === 'reality';

  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selected]} 
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: protocolColors[config.protocol] + '30' }]}>
        <Ionicons 
          name={protocolIcons[config.protocol] || 'server'} 
          size={24} 
          color={isReality ? COLORS.primary : protocolColors[config.protocol]} 
        />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{config.name}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.protocolText, { color: protocolColors[config.protocol] }]}>
            {config.protocol.toUpperCase()}
          </Text>
          {isReality && (
            <View style={styles.realityBadge}>
              <Ionicons name="shield-checkmark" size={10} color={COLORS.primary} />
              <Text style={styles.realityText}>REALITY</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} style={styles.checkIcon} />
        )}
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: SPACING.sm,
  },
  protocolText: {
    fontSize: FONTS.small,
    fontWeight: '700',
  },
  realityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  realityText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: SPACING.sm,
  },
  actionBtn: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
});
