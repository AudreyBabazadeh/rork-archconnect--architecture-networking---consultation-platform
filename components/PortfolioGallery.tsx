import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PortfolioImage {
  id: string;
  uri: string;
  caption: string;
}

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  accentColor?: string;
  layout?: 'grid' | 'masonry';
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ 
  images, 
  accentColor = Colors.primary,
  layout = 'grid' 
}) => {
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxVisible(true);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.galleryContainer}>
        {images.map((image, index) => {
          const isFirstItem = index === 0 && images.length % 2 === 1;
          const itemStyle = layout === 'grid' 
            ? (isFirstItem && images.length > 1 ? styles.gridItemFull : styles.gridItem)
            : styles.masonryItem;

          return (
            <TouchableOpacity
              key={image.id}
              style={itemStyle}
              onPress={() => openLightbox(index)}
              activeOpacity={0.9}
            >
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: image.uri }} 
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageGradient}
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.zoomIndicator}>
                    <ZoomIn size={16} color={Colors.white} />
                  </View>
                  {image.caption && (
                    <Text style={styles.imageCaption} numberOfLines={2}>
                      {image.caption}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={lightboxVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={closeLightbox}
        statusBarTranslucent
      >
        <View style={styles.lightboxContainer}>
          <StatusBar hidden />
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeLightbox}
            activeOpacity={0.8}
          >
            <View style={styles.closeButtonCircle}>
              <X size={24} color={Colors.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.lightboxCounter}>
            <Text style={styles.counterText}>
              {selectedIndex + 1} / {images.length}
            </Text>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedIndex * SCREEN_WIDTH, y: 0 }}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setSelectedIndex(newIndex);
            }}
            style={styles.lightboxScroll}
          >
            {images.map((image) => (
              <View key={image.id} style={styles.lightboxSlide}>
                <Image 
                  source={{ uri: image.uri }} 
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {images[selectedIndex].caption && (
            <View style={styles.captionContainer}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.captionGradient}
              />
              <View style={styles.captionContent}>
                <Text style={styles.captionTitle}>
                  {images[selectedIndex].caption}
                </Text>
              </View>
            </View>
          )}

          {images.length > 1 && (
            <>
              <TouchableOpacity 
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrevious}
                activeOpacity={0.8}
              >
                <View style={styles.navButtonCircle}>
                  <ChevronLeft size={28} color={Colors.white} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
                activeOpacity={0.8}
              >
                <View style={styles.navButtonCircle}>
                  <ChevronRight size={28} color={Colors.white} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48.5%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridItemFull: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 0,
  },
  masonryItem: {
    width: '48.5%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCaption: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
    lineHeight: 16,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxCounter: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  lightboxScroll: {
    flex: 1,
  },
  lightboxSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 100,
  },
  captionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  captionContent: {
    padding: 24,
    paddingBottom: 40,
  },
  captionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    lineHeight: 24,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -28,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  navButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
