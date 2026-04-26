import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useVPN } from '../context/VPNContext';
import { VPNService } from '../services/vpnService';
import { NotificationService } from '../services/notificationService';
import ConnectionButton from '../components/ConnectionButton';
import { COLORS, FONTS, SPACING } from '../utils/constants';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function HomeScreen() {
  const { state: appState } = useApp();
  const { state: vpnState } = useVPN();

  const activeConfig = appState.configs.find(c => c.id === vpnState.currentConfigId);
  const selectedConfig = appState.configs.find(c => c.isActive) || appState.configs[0];

  const handleConnect = async () => {
    if (vpnState.status === 'connected') {
      await VPNService.disconnect();
      await NotificationService.notifyDisconnected();
    } else if (vpnState.status === 'disconnected' || vpnState.status === 'error') {
      const config = selectedConfig || activeConfig;
      if (config) {
        await VPNService.connect(config);
        await NotificationService.notifyConnected(config.name);
      }
    }
  };

  const getStatusColor = () => {
    switch (vpnState.status) {
      case 'connected': return COLORS.success;
      case 'connecting': return COLORS.warning;
      case 'disconnecting': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.textMuted;
    }
  };

  const getStatusText = () => {
    switch (vpnState.status) {
      case 'connected': return 'Подключено';
      case 'connecting': return 'Подключение...';
      case 'disconnecting': return 'Отключение...';
      case 'error': return 'Ошибка подключения';
      default: return 'Не подключено';
    }
  };

  const current = activeConfig || selectedConfig;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusSection}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <ConnectionButton 
          status={vpnState.status} 
          onPress={handleConnect}
          disabled={!selectedConfig && !activeConfig}
        />
      </View>

      {vpnState.status === 'connected' && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="arrow-down" size={20} color={COLORS.info} />
            <Text style={styles.statValue}>{formatBytes(vpnState.downloadSpeed)}</Text>
            <Text style={styles.statLabel}>Загрузка</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="arrow-up" size={20} color={COLORS.primaryLight} />
            <Text style={styles.statValue}>{formatBytes(vpnState.uploadSpeed)}</Text>
            <Text style={styles.statLabel}>Отправка</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="time" size={20} color={COLORS.warning} />
            <Text style={styles.statValue}>{formatDuration(vpnState.duration)}</Text>
            <Text style={styles.statLabel}>Время</Text>
          </View>
        </View>
      )}

      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Текущая конфигурация</Text>
        {current ? (
          <View style={styles.configCard}>
            <View style={[styles.configIcon, { backgroundColor: (current.security === 'reality' ? COLORS.primary : COLORS.textSecondary) + '20' }]}>
              <Ionicons 
                name={current.protocol === 'vmess' ? 'globe' : current.protocol === 'vless' ? 'flash' : current.protocol === 'shadowsocks' ? 'eye-off' : 'lock-closed'} 
                size={24} 
                color={current.security === 'reality' ? COLORS.primary : COLORS.textSecondary} 
              />
            </View>
            <View style={styles.configInfo}>
              <Text style={styles.configName}>{current.name}</Text>
              <View style={styles.configMeta}>
                <Text style={[styles.configProtocol, current.security === 'reality' && { color: COLORS.primary }]}>
                  {current.protocol.toUpperCase()}
                </Text>
                {current.security === 'reality' && (
                  <View style={styles.realityBadge}>
                    <Ionicons name="shield-checkmark" size={10} color={COLORS.primary} />
                    <Text style={styles.realityText}>Reality</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="add-circle" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Нет конфигураций</Text>
            <Text style={styles.emptySubtext}>Добавьте сервер в разделе "Конфиги"</Text>
          </View>
        )}
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
    alignItems: 'center',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.large,
    fontWeight: '600',
  },
  buttonContainer: {
    marginVertical: SPACING.xxl,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    minWidth: 90,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    marginTop: 2,
  },
  configSection: {
    width: '100%',
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.medium,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  configCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  configIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  configInfo: {
    flex: 1,
  },
  configName: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  configMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: SPACING.sm,
  },
  configProtocol: {
    color: COLORS.textSecondary,
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
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.regular,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginTop: SPACING.xs,
  },
});
