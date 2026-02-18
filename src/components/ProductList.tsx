import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
}

const getProductIcon = (productName: string): { icon: string; library: 'ionicons' | 'material' } => {
  const name = productName.toLowerCase();

  // Dairy
  if (name.includes('milk') || name.includes('mleko')) return { icon: 'water', library: 'material' };
  if (name.includes('cheese') || name.includes('ser')) return { icon: 'cheese', library: 'material' };
  if (name.includes('cream') || name.includes('śmietan') || name.includes('smietan')) return { icon: 'cupcake', library: 'material' };
  if (name.includes('butter') || name.includes('masło') || name.includes('maslo')) return { icon: 'cube-outline', library: 'material' };
  if (name.includes('yogurt') || name.includes('jogurt')) return { icon: 'cup', library: 'material' };
  if (name.includes('egg') || name.includes('jaj')) return { icon: 'egg-outline', library: 'material' };

  // Meat
  if (name.includes('meat') || name.includes('mięs') || name.includes('mies') || name.includes('kiełbas') || name.includes('kielbas')) return { icon: 'food-steak', library: 'material' };
  if (name.includes('chicken') || name.includes('kurczak') || name.includes('drób') || name.includes('drob')) return { icon: 'food-drumstick', library: 'material' };
  if (name.includes('fish') || name.includes('ryb')) return { icon: 'fish', library: 'material' };
  if (name.includes('ham') || name.includes('szynk')) return { icon: 'food-steak', library: 'material' };
  if (name.includes('bacon') || name.includes('bekon') || name.includes('boczek')) return { icon: 'food-steak', library: 'material' };

  // Vegetables
  if (name.includes('carrot') || name.includes('marchew')) return { icon: 'carrot', library: 'material' };
  if (name.includes('tomato') || name.includes('pomidor')) return { icon: 'food-apple', library: 'material' };
  if (name.includes('potato') || name.includes('ziemniak') || name.includes('kluski')) return { icon: 'food', library: 'material' };
  if (name.includes('onion') || name.includes('cebul')) return { icon: 'layers-outline', library: 'ionicons' };
  if (name.includes('pepper') || name.includes('papryk')) return { icon: 'chili-mild', library: 'material' };
  if (name.includes('cucumber') || name.includes('ogórek') || name.includes('ogorek')) return { icon: 'leaf', library: 'ionicons' };
  if (name.includes('lettuce') || name.includes('sałat') || name.includes('salat')) return { icon: 'leaf', library: 'ionicons' };
  if (name.includes('vegetable') || name.includes('warzyw')) return { icon: 'leaf', library: 'ionicons' };
  if (name.includes('pickle') || name.includes('kiszon')) return { icon: 'beer-outline', library: 'ionicons' };

  // Fruits
  if (name.includes('apple') || name.includes('jabłk') || name.includes('jablk')) return { icon: 'food-apple', library: 'material' };
  if (name.includes('orange') || name.includes('pomarańcz') || name.includes('pomarancz')) return { icon: 'fruit-citrus', library: 'material' };
  if (name.includes('banana') || name.includes('banan')) return { icon: 'fruit-grapes', library: 'material' };
  if (name.includes('plum') || name.includes('śliwk') || name.includes('sliwk')) return { icon: 'fruit-grapes', library: 'material' };
  if (name.includes('fruit') || name.includes('owoc')) return { icon: 'fruit-cherries', library: 'material' };

  // Condiments & Sauces
  if (name.includes('mustard') || name.includes('musztard')) return { icon: 'bottle-soda-classic-outline', library: 'material' };
  if (name.includes('ketchup')) return { icon: 'bottle-soda-classic-outline', library: 'material' };
  if (name.includes('mayo') || name.includes('majonez')) return { icon: 'bottle-soda-classic-outline', library: 'material' };
  if (name.includes('sauce') || name.includes('sos') || name.includes('pesto')) return { icon: 'bottle-soda-classic-outline', library: 'material' };
  if (name.includes('horseradish') || name.includes('chrzan')) return { icon: 'bottle-soda-classic-outline', library: 'material' };
  if (name.includes('caramel') || name.includes('kajmak')) return { icon: 'cupcake', library: 'material' };

  // Bread & Bakery
  if (name.includes('bread') || name.includes('chleb') || name.includes('bułk') || name.includes('bulk')) return { icon: 'bread-slice', library: 'material' };

  // Beverages
  if (name.includes('juice') || name.includes('sok')) return { icon: 'glass-cocktail', library: 'material' };
  if (name.includes('water') || name.includes('wod')) return { icon: 'water', library: 'ionicons' };
  if (name.includes('beer') || name.includes('piwo')) return { icon: 'beer', library: 'ionicons' };

  // Default
  return { icon: 'nutrition', library: 'ionicons' };
};

const getIconColor = (index: number): string => {
  const colors = [
    '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7',
    '#43A047', '#388E3C', '#2E7D32', '#1B5E20',
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
        {products.map((item, index) => {
          const iconInfo = getProductIcon(item.name);
          const iconColor = getIconColor(index);

          return (
            <View key={item.id} style={styles.productItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                {iconInfo.library === 'ionicons' ? (
                  <Ionicons name={iconInfo.icon as any} size={22} color={iconColor} />
                ) : (
                  <MaterialCommunityIcons name={iconInfo.icon as any} size={22} color={iconColor} />
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            </View>
          );
        })}
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
