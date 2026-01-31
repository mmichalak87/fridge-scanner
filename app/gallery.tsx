import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = (width - 4) / NUM_COLUMNS;
const PAGE_SIZE = 30;
const MAX_IMAGE_WIDTH = 1024;
const COMPRESSION_QUALITY = 0.6;

export default function GalleryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [permission, setPermission] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setPermission(status === 'granted');
    if (status === 'granted') {
      loadPhotos();
    }
  };

  const loadPhotos = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: PAGE_SIZE,
        after: endCursor,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      setPhotos(prev => [...prev, ...result.assets]);
      setEndCursor(result.endCursor);
      setHasMore(result.hasNextPage);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = async (uri: string): Promise<string | null> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_IMAGE_WIDTH } }],
        { compress: COMPRESSION_QUALITY, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      return result.base64 || null;
    } catch (error) {
      console.error('Failed to compress image:', error);
      return null;
    }
  };

  const selectPhoto = async (asset: MediaLibrary.Asset) => {
    setIsProcessing(true);
    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      const uri = assetInfo.localUri || asset.uri;

      const compressedBase64 = await compressImage(uri);
      if (compressedBase64) {
        router.replace({
          pathname: '/results',
          params: { imageBase64: compressedBase64 },
        });
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Failed to select photo:', error);
      setIsProcessing(false);
    }
  };

  const renderPhoto = useCallback(({ item }: { item: MediaLibrary.Asset }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => selectPhoto(item)}
      activeOpacity={0.7}
    >
      <Image source={item.uri} style={styles.photo} contentFit="cover" />
    </TouchableOpacity>
  ), []);

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  };

  if (permission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (permission === false) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="images-outline" size={64} color="#ccc" />
        <Text style={styles.permissionTitle}>{t('camera.noPermission')}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{t('camera.requestPermission')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isProcessing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.processingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('home.galleryButton')}</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          onEndReached={loadPhotos}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * Math.floor(index / NUM_COLUMNS),
            index,
          })}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  grid: {
    padding: 1,
  },
  photoItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    padding: 1,
  },
  photo: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
