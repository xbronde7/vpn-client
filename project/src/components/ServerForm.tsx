import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServerConfig, Protocol } from '../types';
import { COLORS, FONTS, SPACING } from '../utils/constants';

interface Props {
  initialConfig?: Partial<ServerConfig>;
  onSave: (config: Omit<ServerConfig, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const protocols: { value: Protocol; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'vmess', label: 'VMess', icon: 'globe' },
  { value: 'vless', label: 'VLESS', icon: 'flash' },
  { value: 'shadowsocks', label: 'Shadowsocks', icon: 'eye-off' },
  { value: 'trojan', label: 'Trojan', icon: 'lock-closed' },
];

const securityOptions = ['none', 'tls', 'reality', 'xtls'];
const fpOptions = ['chrome', 'firefox', 'safari', 'ios', 'android', 'edge', '360', 'qq', 'random', 'randomized'];
const flowOptions = ['', 'xtls-rprx-vision', 'xtls-rprx-vision-udp443'];

export default function ServerForm({ initialConfig, onSave, onCancel }: Props) {
  const [protocol, setProtocol] = useState<Protocol>(initialConfig?.protocol || 'vless');
  const [name, setName] = useState(initialConfig?.name || '');
  const [server, setServer] = useState(initialConfig?.server || '');
  const [port, setPort] = useState(initialConfig?.port ? String(initialConfig.port) : '');
  const [uuid, setUuid] = useState(initialConfig?.uuid || '');
  const [password, setPassword] = useState(initialConfig?.password || '');
  const [method, setMethod] = useState(initialConfig?.method || 'aes-256-gcm');
  const [security, setSecurity] = useState(initialConfig?.security || '');
  const [network, setNetwork] = useState(initialConfig?.network || 'tcp');
  const [path, setPath] = useState(initialConfig?.path || '');
  const [host, setHost] = useState(initialConfig?.host || '');
  const [sni, setSni] = useState(initialConfig?.sni || '');
  const [alterId, setAlterId] = useState(initialConfig?.alterId ? String(initialConfig.alterId) : '0');
  // Reality fields
  const [pbk, setPk] = useState(initialConfig?.pbk || '');
  const [sid, setSid] = useState(initialConfig?.sid || '');
  const [fp, setFp] = useState(initialConfig?.fp || '');
  const [spiderX, setSpiderX] = useState(initialConfig?.spiderX || '');
  const [flow, setFlow] = useState(initialConfig?.flow || '');

  const handleSave = () => {
    if (!name.trim() || !server.trim() || !port.trim()) return;
    
    const config: Omit<ServerConfig, 'id' | 'createdAt'> = {
      name: name.trim(),
      protocol,
      server: server.trim(),
      port: parseInt(port, 10),
      isActive: false,
    };

    if (protocol === 'vmess' || protocol === 'vless') {
      config.uuid = uuid.trim() || undefined;
    }
    if (protocol === 'shadowsocks' || protocol === 'trojan') {
      config.password = password.trim() || undefined;
    }
    if (protocol === 'shadowsocks') {
      config.method = method || undefined;
    }
    if (protocol === 'vmess') {
      config.alterId = parseInt(alterId, 10) || 0;
    }
    
    config.security = security || undefined;
    config.network = network || undefined;
    config.path = path.trim() || undefined;
    config.host = host.trim() || undefined;
    config.sni = sni.trim() || undefined;
    
    // Reality fields
    if (pbk.trim()) config.pbk = pbk.trim();
    if (sid.trim()) config.sid = sid.trim();
    if (fp.trim()) config.fp = fp.trim();
    if (spiderX.trim()) config.spiderX = spiderX.trim();
    if (flow.trim()) config.flow = flow.trim();

    onSave(config);
  };

  const isReality = security === 'reality';
  const isXtls = security === 'xtls';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Протокол</Text>
      <View style={styles.protocolRow}>
        {protocols.map(p => (
          <TouchableOpacity
            key={p.value}
            style={[styles.protocolBtn, protocol === p.value && styles.protocolBtnActive]}
            onPress={() => setProtocol(p.value)}
          >
            <Ionicons name={p.icon} size={16} color={protocol === p.value ? COLORS.white : COLORS.textSecondary} />
            <Text style={[styles.protocolText, protocol === p.value && styles.protocolTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Название</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Мой сервер" placeholderTextColor={COLORS.textMuted} />

      <Text style={styles.label}>Адрес сервера</Text>
      <TextInput style={styles.input} value={server} onChangeText={setServer} placeholder="192.168.1.1 или domain.com" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />

      <Text style={styles.label}>Порт</Text>
      <TextInput style={styles.input} value={port} onChangeText={setPort} placeholder="443" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />

      {(protocol === 'vmess' || protocol === 'vless') && (
        <>
          <Text style={styles.label}>UUID</Text>
          <TextInput style={styles.input} value={uuid} onChangeText={setUuid} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />
        </>
      )}

      {(protocol === 'shadowsocks' || protocol === 'trojan') && (
        <>
          <Text style={styles.label}>Пароль</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Пароль" placeholderTextColor={COLORS.textMuted} secureTextEntry autoCapitalize="none" />
        </>
      )}

      {protocol === 'shadowsocks' && (
        <>
          <Text style={styles.label}>Метод шифрования</Text>
          <TextInput style={styles.input} value={method} onChangeText={setMethod} placeholder="aes-256-gcm" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />
        </>
      )}

      {protocol === 'vmess' && (
        <>
          <Text style={styles.label}>Alter ID</Text>
          <TextInput style={styles.input} value={alterId} onChangeText={setAlterId} placeholder="0" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
        </>
      )}

      {protocol === 'vless' && (
        <>
          <Text style={styles.label}>Flow (XTLS)</Text>
          <View style={styles.chipRow}>
            {flowOptions.map(opt => (
              <TouchableOpacity 
                key={opt || 'none'} 
                style={[styles.chip, flow === opt && styles.chipActive]}
                onPress={() => setFlow(opt)}
              >
                <Text style={[styles.chipText, flow === opt && styles.chipTextActive]}>{opt || 'none'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Security</Text>
      <View style={styles.chipRow}>
        {securityOptions.map(opt => (
          <TouchableOpacity 
            key={opt} 
            style={[styles.chip, security === opt && styles.chipActive]}
            onPress={() => setSecurity(opt)}
          >
            <Text style={[styles.chipText, security === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {(isReality || isXtls) && protocol === 'vless' && (
        <View style={styles.realityBox}>
          <Text style={styles.realityTitle}>XTLS / Reality настройки</Text>
          
          <Text style={styles.label}>Public Key (pbk)</Text>
          <TextInput 
            style={styles.input} 
            value={pbk} 
            onChangeText={setPk} 
            placeholder="x25519 public key" 
            placeholderTextColor={COLORS.textMuted} 
            autoCapitalize="none"
          />

          <Text style={styles.label}>Short ID (sid)</Text>
          <TextInput 
            style={styles.input} 
            value={sid} 
            onChangeText={setSid} 
            placeholder="Short ID" 
            placeholderTextColor={COLORS.textMuted} 
            autoCapitalize="none"
          />

          <Text style={styles.label}>Fingerprint (fp)</Text>
          <View style={styles.chipRow}>
            {fpOptions.map(opt => (
              <TouchableOpacity 
                key={opt} 
                style={[styles.chip, fp === opt && styles.chipActive]}
                onPress={() => setFp(opt)}
              >
                <Text style={[styles.chipText, fp === opt && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>SpiderX (spx)</Text>
          <TextInput 
            style={styles.input} 
            value={spiderX} 
            onChangeText={setSpiderX} 
            placeholder="/path или пусто" 
            placeholderTextColor={COLORS.textMuted} 
            autoCapitalize="none"
          />
        </View>
      )}

      <Text style={styles.label}>Network (tcp/ws/grpc)</Text>
      <TextInput style={styles.input} value={network} onChangeText={setNetwork} placeholder="tcp" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />

      <Text style={styles.label}>Path (для WebSocket / gRPC)</Text>
      <TextInput style={styles.input} value={path} onChangeText={setPath} placeholder="/path" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />

      <Text style={styles.label}>Host / SNI</Text>
      <TextInput style={styles.input} value={host} onChangeText={setHost} placeholder="sni.example.com" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />

      <Text style={styles.label}>SNI (для Reality / TLS)</Text>
      <TextInput style={styles.input} value={sni} onChangeText={setSni} placeholder="sni.example.com (если отличается от Host)" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
          <Text style={styles.saveText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  protocolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  protocolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  protocolBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  protocolText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    marginLeft: SPACING.xs,
  },
  protocolTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.primary + '30',
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  realityBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  realityTitle: {
    color: COLORS.primary,
    fontSize: FONTS.regular,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: COLORS.surface,
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
});
