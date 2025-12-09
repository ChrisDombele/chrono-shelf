import { numberToFormat } from '@/app/utils/conversions';
import { useFetchWatchData, WatchWithBrand } from '@/hooks/fetchWatchData';
// import Clipboard from '@react-native-clipboard/clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WatchDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { watches, deleteWatch, toggleAcquired } = useFetchWatchData();
  const [watch, setWatch] = useState<WatchWithBrand | null>(null);
  const [loading, setLoading] = useState(true);

  // Find the watch by ID
  useEffect(() => {
    if (id && watches.length > 0) {
      const foundWatch = watches.find((w) => w.id === id);
      setWatch(foundWatch || null);
      setLoading(false);
    }
  }, [id, watches]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (watch) {
      const result = await toggleAcquired(watch.id);
      if (result.success) {
        // The watch list will be updated automatically through the hook
        console.log('Watch status updated');
      } else {
        Alert.alert('Error', result.error || 'Failed to update watch status');
      }
    }
  };

  // Handle edit
  const handleEdit = () => {
    if (watch) {
      router.push({
        pathname: '/pages/editWatchPage',
        params: { id: watch.id },
      });
    }
  };

  // Handle delete
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
        ]
      );
    }
  };

  // Copy text to clipboard
  // const copyToClipboard = (text: string) => {
  //   Clipboard.setString(text);
  //   // Optionally show a success message
  //   Alert.alert('Copied!', 'Text copied to clipboard');
  // };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-#e8e8e8-900" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if watch not found
  if (!watch) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-xl text-center mb-4">
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
    <SafeAreaView className="flex-1 bg#e8e8e8-#e8e8e8-900" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Top Section - Dark background with watch image and info */}
        <View className="relative h-96 bg-gray-900 overflow-hidden">
          {/* Back Button */}
          <TouchableOpacity
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-gray-800 rounded-md items-center justify-center"
            onPress={handleBack}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          {/* Watch Image */}
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-64 h-64 rounded-2xl overflow-hidden bg-gray-800">
              {watch.link ? (
                <Image
                  source={{ uri: watch.link }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gray-700 items-center justify-center">
                  <Text className="text-white text-lg">Watch Image</Text>
                </View>
              )}
            </View>
          </View>

          {/* Watch Info Overlay */}
          <View className="absolute bottom-0 p-6 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
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

        {/* Price Section */}
        <View className="mx-4 mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-gray-500 text-center text-sm mb-2">Price</Text>
          <Text className="text-3xl font-bold text-center text-gray-900">
            {numberToFormat({ number: watch.price, currency: 'USD' })}
          </Text>
        </View>

        {/* Details Section */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-xl font-bold text-gray-900 mb-6">Details</Text>

          <View className="flex-row">
            {/* Left Column */}
            <View className="flex-1">
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1">Brand</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {watch.brand?.brand_name || 'Unknown Brand'}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1">Reference</Text>
                {/* TODO: Add copy to clipboard */}
                {/* <TouchableOpacity
                  onPress={() => copyToClipboard(watch.reference)}
                >
                  <Text className="text-base font-semibold text-gray-900">
                    {watch.reference}
                  </Text>
                </TouchableOpacity> */}
                <Text className="text-base font-semibold text-gray-900">
                  {watch.reference}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1">Status</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                  <Text className="text-base font-semibold text-gray-900">
                    {watch.acquired ? 'Acquired' : 'On Wishlist'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column */}
            <View className="flex-1">
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1">Model</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {watch.line}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1">Link</Text>
                <TouchableOpacity onPress={() => Linking.openURL(watch.link)}>
                  <Text className="text-blue-500 text-sm">Open Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-4 mt-6 mb-8 flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-white border border-gray-300 rounded-2xl py-4 flex-row items-center justify-center"
            onPress={handleEdit}
          >
            <Edit size={20} color="#374151" className="mr-2" />
            <Text className="text-gray-700 font-semibold ml-2">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 border border-[#af2c2c] rounded-2xl py-4 flex-row items-center justify-center"
            onPress={handleDelete}
          >
            <Trash2 size={20} color="#af2c2c" className="mr-2" />
            <Text className="text-[##af2c2c] font-semibold ml-2">Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
