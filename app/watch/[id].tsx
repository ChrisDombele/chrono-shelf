import { useFetchWatchData, WatchWithBrand } from '@/hooks/fetchWatchData';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Copy, Edit, Trash2, Watch } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { numberToFormat } from '../utils/conversions';

export default function WatchDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { watches, deleteWatch, toggleAcquired, refetch } = useFetchWatchData();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [watch, setWatch] = useState<WatchWithBrand | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh data when screen comes into focus (e.g., after editing a watch)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Find the watch by ID
  useEffect(() => {
    if (id && watches.length > 0) {
      const foundWatch = watches.find((w) => w.id === id);
      setWatch(foundWatch || null);
      setLoading(false);
    }
  }, [id, watches]);

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    // Android 12+ shows a system toast automatically — no manual feedback needed.
    // iOS has no built-in clipboard notification, manual feedback needed.
    if (Platform.OS === 'ios') {
      Alert.alert('Copied', `${label} copied to clipboard`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleWishlistToggle = async () => {
    if (watch) {
      const result = await toggleAcquired(watch.id);
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to update watch status');
      }
    }
  };

  const handleEdit = () => {
    if (watch) {
      router.push({
        pathname: '/pages/editWatchPage',
        params: { id: watch.id },
      });
    }
  };

  const handleDelete = async () => {
    if (watch) {
      Alert.alert(
        'Delete Watch',
        `Are you sure you want to delete ${watch.brand?.brand_name} ${watch.line}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const result = await deleteWatch(watch.id);
              if (result.success) {
                router.back();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete watch');
              }
            },
          },
        ],
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-gray-950"
        edges={['top']}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-900 dark:text-white text-lg">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!watch) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-gray-950"
        edges={['top']}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-900 dark:text-white text-xl text-center mb-4">
            Watch not found
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-xl"
            onPress={handleBack}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      edges={['top']}
    >
      {/* ScrollView has its own light/dark bg so the area below the hero is themed correctly */}
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-950"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section — intentionally always dark */}
        <View className="relative h-96 bg-gray-50 overflow-hidden">
          {/* Back Button */}
          <TouchableOpacity
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-md items-center justify-center bg-gray-500/60"
            onPress={handleBack}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          {/* Watch Image */}
          <View className="flex-1 items-center justify-center">
            {watch.image_url ? (
              <Image
                source={{ uri: watch.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-700 items-center justify-center">
                <Watch size={64} color="#9CA3AF" strokeWidth={1} />
              </View>
            )}
          </View>

          {/* Watch Info Overlay */}
          <View className="absolute bottom-0 p-6 bg-gray-900/60 rounded-tr-2xl">
            {/* Wishlist/Acquired Toggle */}
            <TouchableOpacity
              className="flex-row items-center mb-3"
              onPress={handleWishlistToggle}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 ${
                  watch.acquired ? 'bg-white border-white' : 'border-white'
                }`}
              >
                {watch.acquired && (
                  <View className="w-2.5 h-2.5 rounded-full bg-gray-900 m-0.5" />
                )}
              </View>
              <Text className="text-white text-base">
                {watch.acquired ? 'Acquired' : 'Wishlist'}
              </Text>
            </TouchableOpacity>

            {/* Brand and Model */}
            <Text className="text-white text-3xl font-bold mb-2">
              {watch.brand?.brand_name || 'Unknown Brand'}
            </Text>
            <Text className="text-white text-xl opacity-90">{watch.line}</Text>
          </View>
        </View>

        {/* Price Card */}
        <View className="mx-4 mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mb-2">
            Price
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-1"
            onPress={() =>
              copyToClipboard(
                numberToFormat({ number: watch.price, currency: 'USD' }),
                'Price',
              )
            }
            activeOpacity={0.6}
          >
            <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              {numberToFormat({ number: watch.price, currency: 'USD' })}
            </Text>
            <Copy size={13} color={isDark ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {/* Details Card */}
        <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Details
          </Text>

          <View className="flex-row">
            {/* Left Column */}
            <View className="flex-1">
              <View className="mb-4">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Brand
                </Text>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() =>
                    copyToClipboard(watch.brand?.brand_name || '', 'Brand')
                  }
                  activeOpacity={0.6}
                >
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {watch.brand?.brand_name || 'Unknown Brand'}
                  </Text>
                  <Copy size={13} color={isDark ? '#6B7280' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Reference
                </Text>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => copyToClipboard(watch.reference, 'Reference')}
                  activeOpacity={0.6}
                >
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {watch.reference}
                  </Text>
                  <Copy size={13} color={isDark ? '#6B7280' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Status
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      watch.acquired ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                  />
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {watch.acquired ? 'Acquired' : 'On Wishlist'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column — right-aligned */}
            <View className="flex-1 items-end">
              <View className="mb-4 items-end">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Model
                </Text>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => copyToClipboard(watch.line, 'Model')}
                  activeOpacity={0.6}
                >
                  <Text className="text-base font-semibold text-gray-900 dark:text-white text-right">
                    {watch.line}
                  </Text>
                  <Copy size={13} color={isDark ? '#6B7280' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>

              <View className="mb-4 items-end">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Link
                </Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => Linking.openURL(watch.link)}>
                    <Text className="text-blue-500 text-sm">Open Link</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(watch.link, 'Link')}
                  >
                    <Copy size={13} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-4 mt-6 mb-8 flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl py-4 flex-row items-center justify-center"
            onPress={handleEdit}
          >
            <Edit size={20} color={isDark ? '#D1D5DB' : '#374151'} />
            <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 border border-red-700 rounded-2xl py-4 flex-row items-center justify-center"
            onPress={handleDelete}
          >
            <Trash2 size={20} color="#b91c1c" />
            <Text className="text-red-700 font-semibold ml-2">Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
