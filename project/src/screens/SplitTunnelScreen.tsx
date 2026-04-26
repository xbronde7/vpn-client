import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, FONTS, SPACING } from '../utils/constants';

// Demo app list (in real app, would come from native module)
const DEMO_APPS = [
  { packageName: 'com.whatsapp', name: 'WhatsApp' },
  { packageName: 'com.telegram.messenger', name: 'Telegram' },
  { packageName: 'org.telegram.messenger', name: 'Telegram X' },
  { packageName: 'com.instagram.android', name: 'Instagram' },
  { packageName: 'com.vkontakte.android', name: 'VK' },
  { packageName: 'com.google.android.youtube', name: 'YouTube' },
  { packageName: 'com.spotify.music', name: 'Spotify' },
  { packageName: 'com.discord', name: 'Discord' },
  { packageName: 'com.twitter.android', name: 'Twitter / X' },
  { packageName: 'com.facebook.katana', name: 'Facebook' },
  { packageName: 'com.tinder', name: 'Tinder' },
  { packageName: 'com.netflix.mediaclient', name: 'Netflix' },
  { packageName: 'com.google.android.apps.maps', name: 'Google Maps' },
  { packageName: 'com.android.chrome', name: 'Chrome' },
  { packageName: 'org.mozilla.firefox', name: 'Firefox' },
  { packageName: 'com.opera.browser', name: 'Opera' },
  { packageName: 'com.zhiliaoapp.musically', name: 'TikTok' },
  { packageName: 'com.google.android.gm', name: 'Gmail' },
  { packageName: 'com.google.android.apps.docs', name: 'Google Drive' },
  { packageName: 'com.dropbox.android', name: 'Dropbox' },
];

const MODE_OPTIONS = [
  { key: 'all' as const, label: 'Все приложения через VPN', icon: 'globe', desc: 'Весь трафик идет через VPN' },
  { key: 'whitelist' as const, label: 'Только выбранные', icon: 'list', desc: 'Только отмеченные приложения используют VPN' },
  { key: 'blacklist' as const, label: 'Все кроме выбранных', icon: 'shield-half', desc: 'Все приложения кроме отмеченных идут через VPN' },
];

export default function SplitTunnelScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const { splitTunnel } = state.settings;

  const [search, setSearch] = useState('');
  const [selectedApps, setSelectedApps] = useState<Set<string>>(
    () => new Set(splitTunnel.apps.filter(a => a.enabled).map(a => a.packageName))
  );

  const toggleApp = (pkg: string) => {
    const next = new Set(selectedApps);
    if (next.has(pkg)) next.delete(pkg);
    else next.add(pkg);
    setSelectedApps(next);
  };

  const saveChanges = () => {
    const apps = DEMO_APPS.map(app => ({
      ...app,
      enabled: selectedApps.has(app.packageName),
    }));
    dispatch({
      type: 'SET_SPLIT_TUNNEL',
      splitTunnel: {
        ...splitTunnel,
        apps,
      },
    });
    navigation.goBack();
  };

  const filteredApps = DEMO_APPS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.packageName.toLowerCase().includes(search.toLowerCase())
  );

  const getModeLabel = () => {
    switch (splitTunnel.mode) {
      case 'all': return 'Все приложения через VPN';
      case 'whitelist': return `Только выбранные (${selectedApps.size})`;
      case 'blacklist': return `Все кроме выбранных (${selectedApps.size})`;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enable toggle */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="apps" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Избирательное туннелирование</Text>
              <Text style={styles.rowDesc}>{getModeLabel()}</Text>
            </View>
            <Switch
              value={splitTunnel.isEnabled}
              onValueChange={(v) =>
                dispatch({ type: 'SET_SPLIT_TUNNEL', splitTunnel: { ...splitTunnel, isEnabled: v } })
              }
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary + '80' }}
              thumbColor={splitTunnel.isEnabled ? COLORS.primary : COLORS.textSecondary}
            />
          </View>
        </View>

        {/* Mode selector */}
        {splitTunnel.isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Режим работы</Text>
            {MODE_OPTIONS.map(mode => (
              <TouchableOpacity
                key={mode.key}
                style={[styles.modeRow, splitTunnel.mode === mode.key && styles.modeRowActive]}
                onPress={() =>
                  dispatch({ type: 'SET_SPLIT_TUNNEL', splitTunnel: { ...splitTunnel, mode: mode.key } })
                }
              >
                <View style={[styles.modeIcon, splitTunnel.mode === mode.key && { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name={mode.icon as any} size={20} color={splitTunnel.mode === mode.key ? COLORS.primary : COLORS.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeLabel, splitTunnel.mode === mode.key && { color: COLORS.primary }]}>
                    {mode.label}
                  </Text>
                  <Text style={styles.modeDesc}>{mode.desc}</Text>
                </View>
                {splitTunnel.mode === mode.key && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* App list */}
        {splitTunnel.isEnabled && splitTunnel.mode !== 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {splitTunnel.mode === 'whitelist' ? 'Приложения через VPN' : 'Приложения без VPN'}
            </Text>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск приложения..."
                placeholderTextColor={COLORS.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <Text style={styles.hint}>
              {splitTunnel.mode === 'whitelist'
                ? 'Отметьте приложения, которые должны работать через VPN'
                : 'Отметьте приложения, которые НЕ должны идти через VPN'}
            </Text>

            {filteredApps.map(app => {
              const isSelected = selectedApps.has(app.packageName);
              return (
                <TouchableOpacity
                  key={app.packageName}
                  style={[styles.appRow, isSelected && styles.appRowSelected]}
                  onPress={() => toggleApp(app.packageName)}
                >
                  <View style={[styles.appIcon, { backgroundColor: isSelected ? COLORS.primary + '20' : COLORS.surfaceLight }]}>
                    <Ionicons name="cube" size={20} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
                  </View>
                  <View style={styles.appInfo}>
                    <Text style={[styles.appName, isSelected && { color: COLORS.primary }]}>{app.name}</Text>
                    <Text style={styles.appPkg}>{app.packageName}</Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredApps.length === 0 && (
              <View style={styles.emptyApps}>
                <Ionicons name="search" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Ничего не найдено</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
          <Ionicons name="save" size={18} color={COLORS.white} />
          <Text style={styles.saveText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  rowDesc: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    marginTop: 2,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modeRowActive: {
    backgroundColor: COLORS.primary + '08',
  },
  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modeLabel: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  modeDesc: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text,
    fontSize: FONTS.regular,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  appRowSelected: {
    backgroundColor: COLORS.primary + '06',
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  appPkg: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emptyApps: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.regular,
    marginTop: SPACING.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  saveText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    fontWeight: '700',
  },
});
