import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraType, type BarCodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../utils/constants';

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const scanSize = width * 0.7;

export default function QRScanner({ onScan, onClose }: Props) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = ({ data }: BarCodeScanningResult) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Требуется доступ к камере для сканирования QR-кодов</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Разрешить доступ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        type={CameraType.back}
        onBarCodeScanned={scanned ? undefined : handleBarcodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Сканировать QR-код</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <Text style={styles.hint}>Наведите камеру на QR-код конфигурации</Text>

        {scanned && (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>Сканировать снова</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  closeIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.large,
    fontWeight: '600',
  },
  scanArea: {
    width: scanSize,
    height: scanSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  hint: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.md,
    borderRadius: 8,
  },
  rescanBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  rescanText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    fontWeight: '600',
  },
  permissionText: {
    color: COLORS.text,
    fontSize: FONTS.regular,
    textAlign: 'center',
    margin: SPACING.xxl,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: 8,
    marginHorizontal: SPACING.xxl,
  },
  permissionBtnText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    textAlign: 'center',
    fontWeight: '600',
  },
  closeBtn: {
    marginTop: SPACING.lg,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.regular,
  },
});
