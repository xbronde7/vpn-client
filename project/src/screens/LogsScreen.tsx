import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import LogItem from '../components/LogItem';
import { COLORS, FONTS, SPACING } from '../utils/constants';
import { LogEntry } from '../types';

type LogLevel = 'all' | 'debug' | 'info' | 'warning' | 'error';

export default function LogsScreen() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<LogLevel>('all');

  const filteredLogs = filter === 'all' 
    ? state.logs 
    : state.logs.filter(log => log.level === filter);

  const levelOptions: { value: LogLevel; label: string; color: string }[] = [
    { value: 'all', label: 'Все', color: COLORS.text },
    { value: 'debug', label: 'Debug', color: COLORS.textMuted },
    { value: 'info', label: 'Info', color: COLORS.info },
    { value: 'warning', label: 'Warn', color: COLORS.warning },
    { value: 'error', label: 'Error', color: COLORS.error },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {levelOptions.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterBtn, filter === opt.value && { backgroundColor: opt.color + '30', borderColor: opt.color }]}
            onPress={() => setFilter(opt.value)}
          >
            <Text style={[styles.filterText, { color: filter === opt.value ? opt.color : COLORS.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Логов пока нет</Text>
          <Text style={styles.emptySubtext}>Логи появятся после подключения</Text>
        </View>
      ) : (
        <FlatList
          data={[...filteredLogs].reverse()}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LogItem log={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {state.logs.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={() => dispatch({ type: 'CLEAR_LOGS' })}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          <Text style={styles.clearText}>Очистить логи</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBar: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  filterBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    fontSize: FONTS.small,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.xlarge,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: FONTS.regular,
    marginTop: SPACING.sm,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    margin: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  clearText: {
    color: COLORS.error,
    fontSize: FONTS.regular,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});
