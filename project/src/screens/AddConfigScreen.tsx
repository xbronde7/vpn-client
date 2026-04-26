import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { VPNService } from '../services/vpnService';
import { parseAnyLink, fetchSubscription, configToLink } from '../services/configParser';
import ServerForm from '../components/ServerForm';
import QRScanner from '../components/QRScanner';
import { COLORS, FONTS, SPACING } from '../utils/constants';
import QRCode from 'react-native-qrcode-svg';

export default function AddConfigScreen({ navigation }: any) {
  const { dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'manual' | 'qr' | 'link' | 'clipboard' | 'subscription'>('manual');
  const [linkInput, setLinkInput] = useState('');
  const [parsedConfig, setParsedConfig] = useState<any>(null);
  const [parsedConfigs, setParsedConfigs] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMultiPreview, setShowMultiPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { key: 'manual' as const, label: 'Вручную', icon: 'create' as const },
    { key: 'qr' as const, label: 'QR', icon: 'qr-code' as const },
    { key: 'link' as const, label: 'Ссылка', icon: 'link' as const },
    { key: 'clipboard' as const, label: 'Буфер', icon: 'clipboard' as const },
    { key: 'subscription' as const, label: 'Подписка', icon: 'cloud-download' as const },
  ];

  const handleSave = (config: any) => {
    const newConfig = {
      ...config,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_CONFIG', config: newConfig });
    navigation.goBack();
  };

  const handleParseLink = () => {
    const config = parseAnyLink(linkInput.trim());
    if (config) {
      setParsedConfig(config);
      setShowPreview(true);
    } else {
      Alert.alert('Ошибка', 'Не удалось распознать ссылку');
    }
  };

  const handleFetchSubscription = async () => {
    const url = linkInput.trim();
    if (!url || !url.startsWith('http')) {
      Alert.alert('Ошибка', 'Введите валидный URL подписки (начинается с http:// или https://)');
      return;
    }
    
    setIsLoading(true);
    const configs = await fetchSubscription(url);
    setIsLoading(false);
    
    if (configs && configs.length > 0) {
      setParsedConfigs(configs);
      setShowMultiPreview(true);
    } else {
      Alert.alert('Ошибка', 'Не удалось загрузить или распознать подписку. Проверьте URL.');
    }
  };

  const handleQRScan = (data: string) => {
    const config = parseAnyLink(data);
    if (config) {
      setParsedConfig(config);
      setShowPreview(true);
      setShowQR(false);
    } else {
      Alert.alert('Ошибка', 'QR-код не содержит валидную конфигурацию');
    }
  };

  const handleClipboard = async () => {
    const text = await navigator.clipboard?.readText?.() || '';
    const config = parseAnyLink(text.trim());
    if (config) {
      setParsedConfig(config);
      setShowPreview(true);
    } else {
      Alert.alert('Ошибка', 'В буфере обмена нет валидной конфигурации');
    }
  };

  const handleSaveParsed = () => {
    if (parsedConfig) {
      const config = {
        ...parsedConfig,
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_CONFIG', config });
      const logs = VPNService.generateLogs(config);
      dispatch({ type: 'ADD_LOGS', logs });
      setShowPreview(false);
      navigation.goBack();
    }
  };

  const handleSaveMultiple = (configs: any[]) => {
    configs.forEach(cfg => {
      const config = {
        ...cfg,
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_CONFIG', config });
    });
    setShowMultiPreview(false);
    navigation.goBack();
  };

  if (showQR && activeTab === 'qr') {
    return <QRScanner onScan={handleQRScan} onClose={() => setShowQR(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={16} 
              color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'manual' && (
        <ServerForm onSave={handleSave} onCancel={() => navigation.goBack()} />
      )}

      {activeTab === 'qr' && (
        <View style={styles.centerContent}>
          <TouchableOpacity style={styles.bigButton} onPress={() => setShowQR(true)}>
            <Ionicons name="qr-code" size={48} color={COLORS.primary} />
            <Text style={styles.bigButtonText}>Открыть сканер QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'link' && (
        <View style={styles.linkContainer}>
          <Text style={styles.label}>Вставьте ссылку конфигурации</Text>
          <TextInput
            style={styles.input}
            value={linkInput}
            onChangeText={setLinkInput}
            placeholder="vless://uuid@server:port?security=reality&pbk=...&sid=...&fp=chrome..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>Поддерживаются: vless://, vmess://, ss://, trojan://</Text>
          <TouchableOpacity style={styles.parseButton} onPress={handleParseLink}>
            <Text style={styles.parseButtonText}>Распознать</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'clipboard' && (
        <View style={styles.centerContent}>
          <TouchableOpacity style={styles.bigButton} onPress={handleClipboard}>
            <Ionicons name="clipboard" size={48} color={COLORS.primary} />
            <Text style={styles.bigButtonText}>Вставить из буфера</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'subscription' && (
        <View style={styles.linkContainer}>
          <Text style={styles.label}>URL подписки</Text>
          <TextInput
            style={styles.input}
            value={linkInput}
            onChangeText={setLinkInput}
            placeholder="https://example.com/sub/example-token"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>Подписка должна возвращать список ссылок (base64 или plain text)</Text>
          
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Загрузка подписки...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.parseButton} onPress={handleFetchSubscription}>
              <Ionicons name="cloud-download" size={18} color={COLORS.white} />
              <Text style={[styles.parseButtonText, { marginLeft: 8 }]}>Загрузить подписку</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Single Config Preview Modal */}
      <Modal visible={showPreview} transparent animationType="slide" onRequestClose={() => setShowPreview(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Предпросмотр конфигурации</Text>
            {parsedConfig && (
              <>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Название:</Text>
                  <Text style={styles.previewValue}>{parsedConfig.name}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Протокол:</Text>
                  <Text style={styles.previewValue}>{parsedConfig.protocol.toUpperCase()}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Сервер:</Text>
                  <Text style={styles.previewValue}>••••••••</Text>
                </View>
                {parsedConfig.security && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Security:</Text>
                    <Text style={[styles.previewValue, parsedConfig.security === 'reality' && { color: COLORS.primary }]}>
                      {parsedConfig.security.toUpperCase()}
                    </Text>
                  </View>
                )}
                {parsedConfig.pbk && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Public Key:</Text>
                    <Text style={styles.previewValue}>{parsedConfig.pbk.slice(0, 20)}...</Text>
                  </View>
                )}
                <View style={styles.qrContainer}>
                  <QRCode value={configToLink(parsedConfig)} size={150} />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowPreview(false)}>
                    <Text style={styles.cancelText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveParsed}>
                    <Text style={styles.saveText}>Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Multi Config Preview Modal */}
      <Modal visible={showMultiPreview} transparent animationType="slide" onRequestClose={() => setShowMultiPreview(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>Найдено {parsedConfigs.length} конфигураций</Text>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {parsedConfigs.map((cfg, idx) => (
                <View key={idx} style={styles.subItem}>
                  <View style={styles.subIcon}>
                    <Ionicons 
                      name={cfg.protocol === 'vmess' ? 'globe' : cfg.protocol === 'vless' ? 'flash' : cfg.protocol === 'shadowsocks' ? 'eye-off' : 'lock-closed'} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subName}>{cfg.name}</Text>
                    <Text style={styles.subAddr}>•••••••• • {cfg.protocol.toUpperCase()}</Text>
                    {cfg.security === 'reality' && (
                      <Text style={[styles.subAddr, { color: COLORS.primary }]}>Reality ✓</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowMultiPreview(false)}>
                <Text style={styles.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={() => handleSaveMultiple(parsedConfigs)}>
                <Text style={styles.saveText}>Импортировать все</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.surfaceLight,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: 4,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xxl,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  bigButtonText: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  linkContainer: {
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  parseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  parseButtonText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  loadingBox: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  previewLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.regular,
    width: 100,
  },
  previewValue: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
    flex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 8,
    alignSelf: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: COLORS.surfaceLight,
  },
  cancelText: {
    color: COLORS.text,
    fontSize: FONTS.regular,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  saveText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  subIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  subName: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  subAddr: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
  },
});
