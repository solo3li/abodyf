import { View, Text, StyleSheet, FlatList, TextInput, I18nManager } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect } from 'react';
import { fetchInbox, setInboxSearch, selectFilteredInbox } from '../../../store/slices/chatSlice';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import InboxRow from '../../../components/InboxRow';
import { Ionicons } from '@expo/vector-icons';

// Feature 013 T057/T058: Inbox with InboxRow, unread counts, and local Redux search

export default function InboxScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, inboxSearch } = useSelector((state: RootState) => state.chat);
  const filteredInbox = useSelector(selectFilteredInbox);
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    dispatch(fetchInbox());
  }, [dispatch]);

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInLeft.delay(index * 50)}>
      <InboxRow 
        item={item} 
        onPress={() => router.push(`/shared/chat/${item.chatId}`)}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>البريد الوارد</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, isRTL && styles.rtlSearchBox]}>
          <Ionicons name="search" size={20} color="#6c6c90" />
          <TextInput
            style={[styles.searchInput, isRTL && styles.rtlInput]}
            placeholder="بحث في الرسائل..."
            placeholderTextColor="#6c6c90"
            value={inboxSearch}
            onChangeText={(text) => dispatch(setInboxSearch(text))}
          />
          {inboxSearch.length > 0 && (
            <Ionicons 
              name="close-circle" 
              size={20} 
              color="#6c6c90" 
              onPress={() => dispatch(setInboxSearch(''))} 
            />
          )}
        </View>
      </View>

      {error ? (
        <EmptyState icon="alert-circle-outline" title="خطأ في التحميل" description={error} />
      ) : loading && filteredInbox.length === 0 ? (
        <LoadingState message="جاري تحميل الرسائل..." />
      ) : (
        <FlatList
          data={filteredInbox}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.chatId.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="chatbox-ellipses-outline" 
              title={inboxSearch ? "لا توجد نتائج" : "لا توجد رسائل"} 
              description={inboxSearch ? "جرب كلمة بحث أخرى" : "ستظهر هنا محادثاتك المباشرة"} 
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: {
    padding: 24, paddingTop: 60,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#2a2a4e',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  searchContainer: {
    backgroundColor: '#1a1a2e', paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2a2a4e',
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f0f1f', borderRadius: 12,
    paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: '#2a2a4e',
  },
  rtlSearchBox: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingHorizontal: 8 },
  rtlInput: { textAlign: 'right' },
  list: { paddingBottom: 100 },
});