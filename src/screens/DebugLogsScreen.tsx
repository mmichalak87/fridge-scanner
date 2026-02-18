import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { logger } from '../utils/errorLogger';
import { useNavigation } from '@react-navigation/native';

export default function DebugLogsScreen() {
  const [logs, setLogs] = useState(logger.getLogs());
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Debug Logs',
    });

    const unsubscribe = logger.subscribe(() => {
      setLogs(logger.getLogs());
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const handleClear = () => {
    Alert.alert('Clear Logs', 'Are you sure you want to clear all logs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => logger.clear(),
      },
    ]);
  };

  const handleShare = async () => {
    const logsText = logs
      .map(
        log =>
          `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${
            log.data ? `\n${log.data}` : ''
          }`
      )
      .join('\n\n---\n\n');

    try {
      await Share.share({
        message: logsText,
        title: 'CookVision Debug Logs',
      });
    } catch {
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return '#FF6B6B';
      case 'warn':
        return '#FFA500';
      case 'info':
        return '#4CAF50';
      default:
        return '#888';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return 'close-circle';
      case 'warn':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            Total: {logs.length} • Errors: {logs.filter(l => l.level === 'error').length}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleClear}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.logsContainer} contentContainerStyle={styles.logsContent}>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyText}>No logs yet</Text>
            <Text style={styles.emptySubtext}>Errors and warnings will appear here</Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Ionicons
                  name={getLevelIcon(log.level) as any}
                  size={16}
                  color={getLevelColor(log.level)}
                />
                <Text style={[styles.logLevel, { color: getLevelColor(log.level) }]}>
                  {log.level.toUpperCase()}
                </Text>
                <Text style={styles.logTimestamp}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.data && (
                <View style={styles.logData}>
                  <Text style={styles.logDataText}>{log.data}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: { flex: 1 },
  statsText: { fontSize: 14, color: '#666', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  actionButton: { padding: 8 },
  logsContainer: { flex: 1 },
  logsContent: { padding: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#888', marginTop: 8 },
  logEntry: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  logLevel: { fontSize: 12, fontWeight: '700', flex: 1 },
  logTimestamp: { fontSize: 11, color: '#888' },
  logMessage: { fontSize: 14, color: '#333', marginBottom: 4, lineHeight: 20 },
  logData: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8, marginTop: 8 },
  logDataText: { fontSize: 12, color: '#666', fontFamily: 'monospace' },
});
