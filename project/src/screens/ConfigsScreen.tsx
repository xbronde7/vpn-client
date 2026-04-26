import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useVPN } from '../context/VPNContext';
import { VPNService } from '../services/vpnService';
import ConfigCard from '../components/ConfigCard';
import { COLORS, FONTS, SPACING } from '../utils/constants';
import { ServerConfig } from '../types';

export default function ConfigsScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const { state: vpnState } = useVPN();

  const handleSelect = async (config: ServerConfig) => {
    dispatch({ type: 'SET_ACTIVE_CONFIG', id: config.id });
    
    if (vpnState.status === 'connected') {
      await VPNService.disconnect();
      setTimeout(() => VPNService.connect(config), 500);
    }
  };

  const handleEdit = (config: ServerConfig) => {
    navigation.navigate('ConfigDetail', { configId: config.id });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_CONFIG', id });
  };

  return (
    <View style={styles.container}>
      {state.configs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="server-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Нет конфигураций</Text>
          <Text style={styles.emptySubtitle}>Нажмите + чтобы добавить сервер</Text>
        </View>
      ) : (
        <FlatList
          data={state.configs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ConfigCard
              config={item}
              isSelected={item.isActive}
              onSelect={() => handleSelect(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddConfig')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.xlarge,
    fontWeight: '600',
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.regular,
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
