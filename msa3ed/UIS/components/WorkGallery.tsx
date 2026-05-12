import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const itemWidth = (width - 64) / 2;

interface GalleryItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
}

interface WorkGalleryProps {
  items: GalleryItem[];
}

export default function WorkGallery({ items }: WorkGalleryProps) {
  if (!items || items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>لا يوجد أعمال سابقة لعرضها</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>معرض الأعمال</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable key={item.id} style={styles.item}>
            <Image source={{ uri: item.mediaUrl }} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16, textAlign: 'right' },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 16 },
  item: { width: itemWidth, height: itemWidth, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.background },
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.4)' },
  itemTitle: { color: Colors.white, fontSize: 12, fontWeight: '600', textAlign: 'right' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
