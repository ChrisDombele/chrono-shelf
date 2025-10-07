import Spacer from '@/components/Spacer';
import WatchCard from '@/components/WatchCard';
import { useFetchWatchData, Watch } from '@/hooks/fetchWatchData';
import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const {
    watches,
    brands,
    loading,
    error,
    refetch,
    addWatch,
    updateWatch,
    deleteWatch,
    toggleAcquired,
    fetchBrands,
  } = useFetchWatchData();

  // Debug logging
  // console.log('Watches data:', JSON.stringify(watches, null, 2));
  // console.log('Brands data:', JSON.stringify(brands, null, 2));

  const handleWatchPress = (watch: Watch) => {
    console.log('Watch card pressed', watch);
    router.push({
      pathname: '/watch/[id]',
      params: { id: watch.id },
    });
  };

  useEffect(() => {
    refetch();
  }, []);

  // Refresh data when screen comes into focus (e.g., after editing a watch)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <SafeAreaView className="flex-1 px-4" edges={['top', 'left', 'right']}>
      <FlashList
        data={watches}
        renderItem={({ item }) => (
          <>
            <Spacer size="xs" />
            <WatchCard
              id={item.id}
              brand={item.brand?.brand_name ?? ''}
              model={item.line ?? ''}
              reference={item.reference ?? ''}
              imageUrl={item.image_url || undefined}
              price={item.price}
              link={item.link}
              isAcquired={item.acquired}
              onPress={() => handleWatchPress(item)}
            />
            <Spacer size="xs" />
          </>
        )}
        estimatedItemSize={80}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
