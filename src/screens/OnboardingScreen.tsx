import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingSlide {
  key: string;
  icon: string;
  iconType: 'ionicons' | 'material';
  colors: [string, string];
  bgColors: [string, string, string];
}

const slides: OnboardingSlide[] = [
  {
    key: 'welcome',
    icon: 'fridge-outline',
    iconType: 'material',
    colors: ['#4CAF50', '#2E7D32'],
    bgColors: ['#E8F5E9', '#C8E6C9', '#A5D6A7'],
  },
  {
    key: 'scan',
    icon: 'camera',
    iconType: 'ionicons',
    colors: ['#2196F3', '#1565C0'],
    bgColors: ['#E3F2FD', '#BBDEFB', '#90CAF9'],
  },
  {
    key: 'recipes',
    icon: 'restaurant',
    iconType: 'ionicons',
    colors: ['#FF9800', '#F57C00'],
    bgColors: ['#FFF3E0', '#FFE0B2', '#FFCC80'],
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const iconRotateValue = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotScaleAnims = useRef(slides.map(() => new Animated.Value(1))).current;

  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatAnimation = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    floatAnimation(particle1, 3000);
    floatAnimation(particle2, 4000);
    floatAnimation(particle3, 3500);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    dotScaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === currentIndex ? 1.3 : 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  }, [currentIndex]);

  const animateTransition = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: ++iconRotateValue.current,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      animateTransition(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    navigation.replace('Home');
  };

  const currentSlide = slides[currentIndex];
  const iconSpin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={currentSlide.bgColors} style={styles.container}>
      <Animated.View
        style={[styles.particle, styles.particle1, {
          transform: [{ translateY: particle1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }],
          opacity: particle1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.6, 0.3] }),
        }]}
      />
      <Animated.View
        style={[styles.particle, styles.particle2, {
          transform: [{ translateY: particle2.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }],
          opacity: particle2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.5, 0.2] }),
        }]}
      />
      <Animated.View
        style={[styles.particle, styles.particle3, {
          transform: [{ translateX: particle3.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }],
          opacity: particle3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.4, 0.2] }),
        }]}
      />

      <TouchableOpacity style={[styles.skipButton, { top: insets.top + 8 }]} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: currentSlide.colors[1] }]}>
          {t('onboarding.skip')}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Animated.View
          style={[styles.iconWrapper, {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { translateX: slideAnim },
            ],
          }]}
        >
          <Animated.View
            style={[styles.iconGlow, { backgroundColor: currentSlide.colors[0] }, {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({ inputRange: [1, 1.05], outputRange: [0.2, 0.4] }),
            }]}
          />
          <Animated.View style={{ transform: [{ rotate: iconSpin }] }}>
            <LinearGradient
              colors={currentSlide.colors}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {currentSlide.iconType === 'material' ? (
                <MaterialCommunityIcons name={currentSlide.icon as any} size={64} color="#fff" />
              ) : (
                <Ionicons name={currentSlide.icon as any} size={64} color="#fff" />
              )}
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[styles.textContainer, {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }]}
        >
          <Text style={[styles.title, { color: currentSlide.colors[1] }]}>
            {t(`onboarding.${currentSlide.key}.title`)}
          </Text>
          <Text style={styles.description}>
            {t(`onboarding.${currentSlide.key}.description`)}
          </Text>
        </Animated.View>

        <View style={styles.dotsContainer}>
          {slides.map((slide, index) => (
            <TouchableOpacity
              key={slide.key}
              onPress={() => { if (index !== currentIndex) animateTransition(index); }}
            >
              <Animated.View
                style={[styles.dot, {
                  backgroundColor: index === currentIndex ? currentSlide.colors[0] : 'rgba(0,0,0,0.2)',
                  width: index === currentIndex ? 28 : 10,
                  transform: [{ scale: dotScaleAnims[index] }],
                }]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.bottomContainer, { bottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={currentSlide.colors}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressBar, {
                backgroundColor: currentSlide.colors[0],
                width: `${((currentIndex + 1) / slides.length) * 100}%`,
              }]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {slides.length}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  particle: { position: 'absolute', borderRadius: 50 },
  particle1: { width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.5)', top: '15%', left: '10%' },
  particle2: { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.4)', top: '25%', right: '15%' },
  particle3: { width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.3)', bottom: '30%', left: '5%' },
  skipButton: { position: 'absolute', right: 24, zIndex: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)' },
  skipText: { fontSize: 15, fontWeight: '600' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconWrapper: { marginBottom: 24, position: 'relative' },
  iconGlow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, top: -15, left: -15 },
  iconGradient: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
  textContainer: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 17, color: '#555', textAlign: 'center', lineHeight: 26, paddingHorizontal: 10 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 },
  dot: { height: 10, borderRadius: 5 },
  bottomContainer: { position: 'absolute', left: 40, right: 40 },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8 },
  nextButtonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  arrowContainer: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  progressTrack: { flex: 1, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 13, color: '#666', fontWeight: '600' },
});
