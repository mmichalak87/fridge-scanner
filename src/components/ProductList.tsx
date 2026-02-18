import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
}

const getBgColor = (index: number): string => {
  const colors = [
    '#E8F5E9',
    '#FFF3E0',
    '#E3F2FD',
    '#FCE4EC',
    '#F3E5F5',
    '#E0F7FA',
    '#FFF8E1',
    '#F1F8E9',
  ];
  return colors[index % colors.length];
};

export function ProductList({ products }: ProductListProps) {
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="fridge-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>{t('results.noProducts')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="fridge-outline" size={24} color="#4CAF50" />
        <Text style={styles.title}>{t('results.productsFound')}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{products.length}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {products.map((item, index) => (
          <View key={item.id} style={styles.productItem}>
            <View style={[styles.emojiContainer, { backgroundColor: getBgColor(index) }]}>
              <Text style={styles.emoji}>{item.emoji || '🍽️'}</Text>
            </View>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  emojiContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 18,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
