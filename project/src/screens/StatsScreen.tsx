import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useVPN } from '../context/VPNContext';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { COLORS, FONTS, SPACING } from '../utils/constants';

function formatBytesTotal(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}ч ${m}м ${s}с`;
}

export default function StatsScreen() {
  const { state: vpnState } = useVPN();
  const { state: appState } = useApp();

  // Calculate some demo stats based on duration
  const sessionDownload = vpnState.duration * 250000 + Math.floor(Math.random() * 100000);
  const sessionUpload = vpnState.duration * 50000 + Math.floor(Math.random() * 20000);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Статистика</Text>

      <View style={styles.row}>
        <StatCard
          title="Загрузка"
          value={formatBytesTotal(sessionDownload)}
          icon="arrow-down"
          color={COLORS.info}
        />
        <StatCard
          title="Отправка"
          value={formatBytesTotal(sessionUpload)}
          icon="arrow-up"
          color={COLORS.primaryLight}
        />
      </View>

      <View style={styles.row}>
        <StatCard
          title="Время сессии"
          value={vpnState.status === 'connected' ? formatDuration(vpnState.duration) : '—'}
          icon="time"
          color={COLORS.warning}
        />
        <StatCard
          title="Скорость ↓"
          value={vpnState.status === 'connected' ? formatBytesTotal(vpnState.downloadSpeed) + '/с' : '—'}
          icon="speedometer"
          color={COLORS.success}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Текущее соединение</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Статус</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { 
              backgroundColor: vpnState.status === 'connected' ? COLORS.success : 
                              vpnState.status === 'connecting' ? COLORS.warning : COLORS.textMuted 
            }]} />
            <Text style={styles.statusValue}>
              {vpnState.status === 'connected' ? 'Подключено' : 
               vpnState.status === 'connecting' ? 'Подключение...' : 'Отключено'}
            </Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Сервер</Text>
          <Text style={styles.statusValue}>
            {appState.configs.find(c => c.id === vpnState.currentConfigId)?.name || '—'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Адрес</Text>
          <Text style={styles.statusValue}>
            {vpnState.currentConfigId ? 
              `${appState.configs.find(c => c.id === vpnState.currentConfigId)?.server || ''}:` +
              `${appState.configs.find(c => c.id === vpnState.currentConfigId)?.port || ''}` : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация</Text>
        <Text style={styles.infoText}>
          В демонстрационном режиме статистика генерируется симуляцией. 
          В реальном приложении здесь будут реальные данные трафика из VPN-туннеля.
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
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.xxlarge,
    fontWeight: '700',
    marginBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.medium,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.regular,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusValue: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    lineHeight: 20,
  },
});
