import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Substitution } from '../types';

interface SubstitutionBadgeProps {
  substitution: Substitution;
}

export function SubstitutionBadge({ substitution }: SubstitutionBadgeProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>*</Text>
        <Text style={styles.title}>{t('substitution.tip')}</Text>
      </View>
      <Text style={styles.text}>
        {t('substitution.canSubstitute')}{' '}
        <Text style={styles.highlight}>{substitution.original}</Text>{' '}
        {t('substitution.with')}{' '}
        <Text style={styles.highlight}>{substitution.replacement}</Text>
      </Text>
      {substitution.reason && (
        <Text style={styles.reason}>{substitution.reason}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
    color: '#FF9800',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },
  text: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
    color: '#E65100',
  },
  reason: {
    fontSize: 13,
    color: '#795548',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
