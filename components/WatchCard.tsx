import { numberToFormat } from '@/utils/conversions';
import { CheckCircle, Circle, Watch } from 'lucide-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface WatchCardProps {
  id: string;
  brand: string;
  model: string;
  reference: string;
  imageUrl?: string;
  price: number;
  link?: string;
  isAcquired?: boolean;
  onPress?: () => void;
}

export default function WatchCard({
  brand,
  model,
  reference,
  imageUrl,
  price,
  isAcquired,
  onPress,
}: WatchCardProps) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center overflow-hidden mr-3">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Watch size={24} color="#9CA3AF" strokeWidth={1.5} />
          )}
        </View>

        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>
            {brand}
          </Text>
          <Text className="text-sm text-gray-700 dark:text-gray-300" numberOfLines={1}>
            {model}
          </Text>
          {!!reference && (
            <Text className="text-xs font-mono text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {reference}
            </Text>
          )}
        </View>

        <View className="items-end">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">
            {numberToFormat({ number: price, currency: 'USD' })}
          </Text>
          <View className="flex-row items-center">
            {isAcquired ? (
              <>
                <CheckCircle size={14} color="#16A34A" />
                <Text className="text-xs text-green-600 dark:text-green-500 ml-1">Acquired</Text>
              </>
            ) : (
              <>
                <Circle size={14} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">Wishlist</Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
