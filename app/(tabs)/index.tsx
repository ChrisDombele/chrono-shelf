import WatchCard from '@/components/WatchCard';
import WatchFilterModal, { DEFAULT_FILTERS, WatchFilters } from '@/components/WatchFilterModal';
import WatchGridCard from '@/components/WatchGridCard';
import { useFetchWatchData, WatchWithBrand } from '@/hooks/fetchWatchData';
import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import { Funnel, LayoutGrid, List, Search, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'list' | 'grid';

export default function App() {
  const { watches, refetch } = useFetchWatchData();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<WatchFilters>(DEFAULT_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    watches.forEach((w) => {
      const name = w.brand?.brand_name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [watches]);

  const visibleWatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = watches.filter((w) => {
      if (
        query &&
        ![w.brand?.brand_name, w.line, w.reference].some((field) =>
          field?.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
      if (filters.status === 'acquired' && !w.acquired) return false;
      if (filters.status === 'wishlist' && w.acquired) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(w.brand?.brand_name ?? '')) {
        return false;
      }
      return true;
    });

    switch (filters.sort) {
      case 'price_desc':
        return result.sort((a, b) => b.price - a.price);
      case 'price_asc':
        return result.sort((a, b) => a.price - b.price);
      case 'brand_asc':
        return result.sort((a, b) =>
          (a.brand?.brand_name ?? '').localeCompare(b.brand?.brand_name ?? '')
        );
      default:
        return result;
    }
  }, [watches, filters, searchQuery]);

  const acquiredCount = watches.filter((w) => w.acquired).length;
  const filtersActive =
    filters.sort !== DEFAULT_FILTERS.sort ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.brands.length > 0;

  const handleWatchPress = (watch: WatchWithBrand) => {
    router.push({ pathname: '/watch/[id]', params: { id: watch.id } });
  };

  const iconColor = isDark ? '#D1D5DB' : '#374151';
  const toggleButtonClass = (mode: ViewMode) =>
    `w-9 h-8 rounded-md items-center justify-center ${
      viewMode === mode ? 'bg-white dark:bg-gray-600' : ''
    }`;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-4 pt-2 pb-4 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">My Watches</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {acquiredCount} acquired • {visibleWatches.length} shown
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center"
              onPress={() => setFiltersVisible(true)}
            >
              <Funnel size={20} color={iconColor} />
              {filtersActive && (
                <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </TouchableOpacity>

            <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <TouchableOpacity className={toggleButtonClass('grid')} onPress={() => setViewMode('grid')}>
                <LayoutGrid size={18} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity className={toggleButtonClass('list')} onPress={() => setViewMode('list')}>
                <List size={18} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-row items-center mt-3 px-3 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-2.5 ml-2 text-sm text-gray-900 dark:text-white"
            placeholder="Search watches..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlashList
        key={viewMode}
        data={visibleWatches}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 24 }}
        renderItem={({ item }) =>
          viewMode === 'grid' ? (
            <View className="p-1.5">
              <WatchGridCard
                brand={item.brand?.brand_name ?? ''}
                model={item.line ?? ''}
                imageUrl={item.image_url || undefined}
                price={item.price}
                isAcquired={item.acquired}
                onPress={() => handleWatchPress(item)}
              />
            </View>
          ) : (
            <View className="px-1.5 py-1.5">
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
            </View>
          )
        }
        ListEmptyComponent={
          watches.length > 0 ? (
            <View className="items-center mt-16">
              <Text className="text-gray-500 dark:text-gray-400 mb-3">
                No watches match your search or filters
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setFilters(DEFAULT_FILTERS);
                  setSearchQuery('');
                }}
              >
                <Text className="text-blue-600 font-semibold">Reset filters</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <WatchFilterModal
        visible={filtersVisible}
        filters={filters}
        brandCounts={brandCounts}
        onApply={(next) => {
          setFilters(next);
          setFiltersVisible(false);
        }}
        onClose={() => setFiltersVisible(false)}
      />
    </SafeAreaView>
  );
}
