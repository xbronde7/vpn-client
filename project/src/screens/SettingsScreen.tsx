import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, FONTS, SPACING } from '../utils/constants';

export default function SettingsScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    dispatch({
      type: 'SET_SETTINGS',
      settings: { ...settings, [key]: value },
    });
  };

  const getSplitLabel = () => {
    if (!settings.splitTunnel.isEnabled) return 'Выключено';
    switch (settings.splitTunnel.mode) {
      case 'all': return 'Все через VPN';
      case 'whitelist': return `Только выбранные (${settings.splitTunnel.apps.filter(a => a.enabled).length})`;
      case 'blacklist': return `Все кроме выбранных (${settings.splitTunnel.apps.filter(a => a.enabled).length})`;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Настройки</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Общие</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="moon" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Темная тема</Text>
            <Text style={styles.rowDesc}>Использовать темную тему</Text>
          </View>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={(v) => updateSetting('theme', v ? 'dark' : 'light')}
            trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary + '80' }}
            thumbColor={settings.theme === 'dark' ? COLORS.primary : COLORS.textSecondary}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="wifi" size={20} color={COLORS.success} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Обход LAN</Text>
            <Text style={styles.rowDesc}>Не проксировать локальные адреса</Text>
          </View>
          <Switch
            value={settings.bypassLan}
            onValueChange={(v) => updateSetting('bypassLan', v)}
            trackColor={{ false: COLORS.surfaceLight, true: COLORS.success + '80' }}
            thumbColor={settings.bypassLan ? COLORS.success : COLORS.textSecondary}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="power" size={20} color={COLORS.warning} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Автоподключение</Text>
            <Text style={styles.rowDesc}>Подключаться при запуске</Text>
          </View>
          <Switch
            value={settings.autoConnect}
            onValueChange={(v) => updateSetting('autoConnect', v)}
            trackColor={{ false: COLORS.surfaceLight, true: COLORS.warning + '80' }}
            thumbColor={settings.autoConnect ? COLORS.warning : COLORS.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Приложения</Text>

        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SplitTunnel')}>
          <View style={styles.rowIcon}>
            <Ionicons name="apps" size={20} color={COLORS.info} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Избирательное туннелирование</Text>
            <Text style={styles.rowDesc}>{getSplitLabel()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Сеть</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="globe" size={20} color={COLORS.info} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>DNS сервер</Text>
            <Text style={styles.rowDesc}>Текущий: {settings.dns}</Text>
          </View>
          <TouchableOpacity onPress={() => updateSetting('dns', settings.dns === '1.1.1.1' ? '8.8.8.8' : '1.1.1.1')}>
            <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="swap-horizontal" size={20} color={COLORS.accent} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>MTU</Text>
            <Text style={styles.rowDesc}>Размер пакета: {settings.mtu}</Text>
          </View>
          <TouchableOpacity onPress={() => updateSetting('mtu', settings.mtu === 1500 ? 1280 : 1500)}>
            <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Системные</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="document-text" size={20} color={COLORS.textSecondary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Уровень логов</Text>
            <Text style={styles.rowDesc}>{settings.logLevel.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const levels = ['debug', 'info', 'warning', 'error'] as const;
              const idx = levels.indexOf(settings.logLevel);
              updateSetting('logLevel', levels[(idx + 1) % levels.length]);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="language" size={20} color={COLORS.textSecondary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Язык</Text>
            <Text style={styles.rowDesc}>{settings.language === 'ru' ? 'Русский' : 'English'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => updateSetting('language', settings.language === 'ru' ? 'en' : 'ru')}
          >
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Версия</Text>
            <Text style={styles.rowDesc}>1.0.0 (Demo)</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="code-slash" size={20} color={COLORS.textSecondary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Сборка</Text>
            <Text style={styles.rowDesc}>React Native + Expo</Text>
          </View>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="warning" size={20} color={COLORS.warning} />
        <Text style={styles.warningText}>
          Это демонстрационная версия. Для реальной VPN-функциональности требуется интеграция нативных VPN-модулей.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.xxlarge,
    fontWeight: '700',
    marginBottom: SPACING.xl,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.lg,
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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    alignItems: 'flex-start',
  },
  warningText: {
    color: COLORS.warning,
    fontSize: FONTS.small,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 18,
  },
});
