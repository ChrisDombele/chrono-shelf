import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export type SortOption = 'default' | 'price_desc' | 'price_asc' | 'brand_asc';
export type StatusFilter = 'all' | 'acquired' | 'wishlist';

export interface WatchFilters {
  sort: SortOption;
  status: StatusFilter;
  brands: string[];
}

export const DEFAULT_FILTERS: WatchFilters = {
  sort: 'default',
  status: 'all',
  brands: [],
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'brand_asc', label: 'Brand: A to Z' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'acquired', label: 'Acquired' },
  { value: 'wishlist', label: 'Wishlist' },
];

interface WatchFilterModalProps {
  visible: boolean;
  filters: WatchFilters;
  brandCounts: { name: string; count: number }[];
  onApply: (filters: WatchFilters) => void;
  onClose: () => void;
}

export default function WatchFilterModal({
  visible,
  filters,
  brandCounts,
  onApply,
  onClose,
}: WatchFilterModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [draft, setDraft] = useState<WatchFilters>(filters);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(filters);
      setSortOpen(false);
    }
  }, [visible, filters]);

  const toggleBrand = (name: string) => {
    setDraft((prev) => ({
      ...prev,
      brands: prev.brands.includes(name)
        ? prev.brands.filter((b) => b !== name)
        : [...prev.brands, name],
    }));
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.value === draft.sort)?.label;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center px-5" onPress={onClose}>
        <Pressable
          className="bg-white dark:bg-gray-900 rounded-2xl max-h-[85%] overflow-hidden"
          onPress={() => {}}
        >
          {/* Header */}
          <View className="flex-row items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <View className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 items-center justify-center mr-3">
              <SlidersHorizontal size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Filters</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Customize your collection view
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <X size={22} color={isDark ? '#D1D5DB' : '#374151'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5" contentContainerStyle={{ paddingVertical: 16 }}>
            {/* Sort */}
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Sort By
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-3"
              onPress={() => setSortOpen((o) => !o)}
            >
              <Text className="text-sm text-gray-900 dark:text-white">{sortLabel}</Text>
              <ChevronDown size={18} color="#9CA3AF" />
            </TouchableOpacity>
            {sortOpen && (
              <View className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className="flex-row items-center justify-between px-3 py-3 bg-white dark:bg-gray-800"
                    onPress={() => {
                      setDraft((prev) => ({ ...prev, sort: option.value }));
                      setSortOpen(false);
                    }}
                  >
                    <Text className="text-sm text-gray-900 dark:text-white">{option.label}</Text>
                    {draft.sort === option.value && <Check size={16} color="#3B82F6" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Status */}
            <Text className="text-base font-semibold text-gray-900 dark:text-white mt-5 mb-2">
              Status
            </Text>
            <View className="flex-row gap-2">
              {STATUS_OPTIONS.map((option) => {
                const selected = draft.status === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    className={`flex-1 py-3 rounded-lg items-center border ${
                      selected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                    onPress={() => setDraft((prev) => ({ ...prev, status: option.value }))}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Brands */}
            {brandCounts.length > 0 && (
              <>
                <Text className="text-base font-semibold text-gray-900 dark:text-white mt-5 mb-1">
                  Brands
                </Text>
                {brandCounts.map(({ name, count }) => {
                  const checked = draft.brands.includes(name);
                  return (
                    <TouchableOpacity
                      key={name}
                      className="flex-row items-center py-2"
                      onPress={() => toggleBrand(name)}
                    >
                      <View
                        className={`w-5 h-5 rounded border items-center justify-center mr-3 ${
                          checked
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                      <Text className="flex-1 text-sm text-gray-800 dark:text-gray-200">{name}</Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">{count}</Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg items-center border border-gray-200 dark:border-gray-700"
              onPress={() => setDraft(DEFAULT_FILTERS)}
            >
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row py-3 rounded-lg items-center justify-center bg-blue-600"
              onPress={() => onApply(draft)}
            >
              <Check size={16} color="#FFFFFF" />
              <Text className="text-sm font-semibold text-white ml-2">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
