import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useVPN } from '../context/VPNContext';
import { VPNService } from '../services/vpnService';
import { configToLink } from '../services/configParser';
import ServerForm from '../components/ServerForm';
import { COLORS, FONTS, SPACING } from '../utils/constants';
import QRCode from 'react-native-qrcode-svg';

export default function ConfigDetailScreen({ route, navigation }: any) {
  const { configId } = route.params;
  const { state, dispatch } = useApp();
  const { state: vpnState } = useVPN();
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showServer, setShowServer] = useState(false);

  const config = state.configs.find(c => c.id === configId);

  if (!config) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Конфигурация не найдена</Text>
      </View>
    );
  }

  const isConnected = vpnState.currentConfigId === config.id && vpnState.status === 'connected';
  const isReality = config.security === 'reality';

  const handleUpdate = (updated: any) => {
    dispatch({
      type: 'UPDATE_CONFIG',
      config: { ...config, ...updated } as typeof config,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (isConnected) {
      VPNService.disconnect();
    }
    dispatch({ type: 'DELETE_CONFIG', id: config.id });
    navigation.goBack();
  };

  const handleShare = async () => {
    const link = configToLink(config);
    try {
      await Share.share({ message: link });
    } catch {
      alert('Не удалось поделиться');
    }
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Редактирование</Text>
          <View style={{ width: 24 }} />
        </View>
        <ServerForm
          initialConfig={config}
          onSave={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <View style={[styles.protocolIcon, { backgroundColor: isReality ? COLORS.primary + '30' : COLORS.primary + '20' }]}>
          <Ionicons 
            name={config.protocol === 'vmess' ? 'globe' : config.protocol === 'vless' ? 'flash' : config.protocol === 'shadowsocks' ? 'eye-off' : 'lock-closed'} 
            size={32} 
            color={isReality ? COLORS.primary : COLORS.primary} 
          />
        </View>
        <Text style={styles.name}>{config.name}</Text>
        <View style={styles.badges}>
          <View style={styles.protocolBadge}>
            <Text style={styles.protocolText}>{config.protocol.toUpperCase()}</Text>
          </View>
          {isReality && (
            <View style={[styles.protocolBadge, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.protocolText, { color: COLORS.primary }]}>REALITY</Text>
            </View>
          )}
        </View>
        {isConnected && (
          <View style={styles.connectedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.connectedText}>Активно</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация о сервере</Text>
        <View style={styles.maskedRow}>
          <Text style={styles.infoLabel}>Адрес сервера</Text>
          <TouchableOpacity onPress={() => setShowServer(!showServer)} style={styles.maskBtn}>
            <Ionicons name={showServer ? 'eye-off' : 'eye'} size={16} color={COLORS.textSecondary} />
            <Text style={styles.maskText}>{showServer ? 'Скрыть' : 'Показать'}</Text>
          </TouchableOpacity>
        </View>
        {showServer ? (
          <>
            <InfoRow label="Сервер" value={config.server} />
            <InfoRow label="Порт" value={String(config.port)} />
          </>
        ) : (
          <Text style={styles.maskedValue}>••••••••:••••</Text>
        )}
        <InfoRow label="Security" value={config.security || '-'} />
        <InfoRow label="Network" value={config.network || '-'} />
        <InfoRow label="Host / SNI" value={config.host || config.sni || '-'} />
        {config.sni && config.sni !== config.host && (
          <InfoRow label="SNI (отдельно)" value={config.sni} />
        )}
        {config.flow && (
          <InfoRow label="Flow" value={config.flow} />
        )}
      </View>

      {isReality && config.pbk && (
        <View style={[styles.section, { borderColor: COLORS.primary + '40' }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>XTLS Reality</Text>
          <InfoRow label="Public Key" value={config.pbk} masked />
          {config.sid && <InfoRow label="Short ID" value={config.sid} />}
          {config.fp && <InfoRow label="Fingerprint" value={config.fp} />}
          {config.spiderX && <InfoRow label="SpiderX" value={config.spiderX} />}
        </View>
      )}

      {(config.uuid || config.password) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Аутентификация</Text>
          {config.uuid && <InfoRow label="UUID" value={config.uuid} masked />}
          {config.password && <InfoRow label="Пароль" value={config.password} masked />}
          {config.method && <InfoRow label="Метод" value={config.method} />}
          {config.alterId !== undefined && <InfoRow label="Alter ID" value={String(config.alterId)} />}
        </View>
      )}

      <View style={styles.actionsSection}>
        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={() => setShowQR(true)}>
          <Ionicons name="qr-code" size={20} color={COLORS.white} />
          <Text style={styles.primaryBtnText}>Показать QR-код</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={COLORS.text} />
          <Text style={styles.secondaryBtnText}>Поделиться ссылкой</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={() => setIsEditing(true)}>
          <Ionicons name="create-outline" size={20} color={COLORS.text} />
          <Text style={styles.secondaryBtnText}>Редактировать</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={styles.dangerBtnText}>Удалить</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showQR} transparent animationType="fade" onRequestClose={() => setShowQR(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowQR(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>{config.name}</Text>
            {isReality && (
              <View style={[styles.realityBadge, { marginBottom: 12 }]}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontSize: 12, marginLeft: 4, fontWeight: '600' }}>Reality</Text>
              </View>
            )}
            <View style={styles.qrWrapper}>
              <QRCode value={configToLink(config)} size={220} />
            </View>
            <Text style={styles.qrHint}>Отсканируйте для импорта</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InfoRow({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  const [show, setShow] = useState(false);
  const displayValue = masked && !show ? '•'.repeat(Math.min(value.length, 20)) : value;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.infoValue} numberOfLines={1}>{displayValue}</Text>
        {masked && (
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Ionicons name={show ? 'eye-off' : 'eye'} size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONTS.large,
    fontWeight: '600',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  protocolIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  name: {
    color: COLORS.text,
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  protocolText: {
    color: COLORS.primary,
    fontSize: FONTS.small,
    fontWeight: '700',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  connectedText: {
    color: COLORS.success,
    fontSize: FONTS.small,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.medium,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  maskedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  maskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  maskText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
  },
  maskedValue: {
    color: COLORS.textMuted,
    fontSize: FONTS.regular,
    paddingVertical: SPACING.sm,
    fontFamily: 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.regular,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: SPACING.md,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  actionsSection: {
    marginTop: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  dangerBtn: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error + '30',
  },
  dangerBtnText: {
    color: COLORS.error,
    fontSize: FONTS.regular,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '85%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: SPACING.xs,
  },
  qrTitle: {
    color: COLORS.text,
    fontSize: FONTS.large,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  realityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qrWrapper: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
  },
  qrHint: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    marginTop: SPACING.lg,
  },
});
