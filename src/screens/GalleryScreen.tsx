import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = (width - 4) / NUM_COLUMNS;
const PAGE_SIZE = 30;
const MAX_IMAGE_WIDTH = 1024;
const COMPRESSION_QUALITY = 60;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Gallery'>;

interface PhotoAsset {
  uri: string;
  id: string;
}

export default function GalleryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPhotos = async () => {
    if (isLoading || (!hasMore && photos.length > 0)) return;

    setIsLoading(true);
    try {
      const result = await CameraRoll.getPhotos({
        first: PAGE_SIZE,
        after: endCursor,
        assetType: 'Photos',
      });

      const newPhotos = result.edges.map((edge, index) => ({
        uri: edge.node.image.uri,
        id: `${edge.node.image.uri}_${photos.length + index}`,
      }));

      setPhotos(prev => {
        const existingUris = new Set(prev.map(p => p.uri));
        const unique = newPhotos.filter(p => !existingUris.has(p.uri));
        return [...prev, ...unique];
      });
      setEndCursor(result.page_info.end_cursor);
      setHasMore(result.page_info.has_next_page);
      setHasPermission(true);
    } catch (error) {
      console.error('Failed to load photos:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = async (uri: string): Promise<string | null> => {
    try {
      const result = await ImageResizer.createResizedImage(
        uri,
        MAX_IMAGE_WIDTH,
        MAX_IMAGE_WIDTH,
        'JPEG',
        COMPRESSION_QUALITY,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );
      const base64 = await RNFS.readFile(result.uri, 'base64');
      return base64;
    } catch (error) {
      console.error('Failed to compress image:', error);
      return null;
    }
  };

  const selectPhoto = useCallback(
    async (asset: PhotoAsset) => {
      setIsProcessing(true);
      try {
        const compressedBase64 = await compressImage(asset.uri);
        if (compressedBase64) {
          navigation.replace('Results', { imageBase64: compressedBase64 });
        } else {
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Failed to select photo:', error);
        setIsProcessing(false);
      }
    },
    [navigation]
  );

  const renderPhoto = useCallback(
    ({ item }: { item: PhotoAsset }) => (
      <TouchableOpacity
        style={styles.photoItem}
        onPress={() => selectPhoto(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.uri }} style={styles.photo} resizeMode="cover" />
      </TouchableOpacity>
    ),
    [selectPhoto]
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="images-outline" size={64} color="#ccc" />
        <Text style={styles.permissionTitle}>{t('camera.noPermission')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('home.galleryButton')}</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={item => item.id}
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
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  processingText: { marginTop: 16, fontSize: 16, color: '#666' },
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
  backButton: { paddingHorizontal: 32, paddingVertical: 14 },
  backButtonText: { fontSize: 16, color: '#666' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 44, height: 44 },
  grid: { padding: 1 },
  photoItem: { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
  photo: { flex: 1, backgroundColor: '#f0f0f0' },
  footer: { padding: 20, alignItems: 'center' },
});
