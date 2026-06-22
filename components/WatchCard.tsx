import { numberToFormat } from '@/app/utils/conversions';
import { CheckCircle, Circle } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

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
  id,
  brand,
  model,
  reference,
  imageUrl,
  price,
  link,
  isAcquired,
  onPress,
}: WatchCardProps) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View className="flex-row items-center">
        {/* Product Details */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {brand}
          </Text>
          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            Model: {model}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ref: {reference}
          </Text>
        </View>

        {/* Price and Wishlist */}
        <View className="items-end">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {numberToFormat({ number: price, currency: 'USD' })}
          </Text>
          <View className="flex-row items-center">
            {isAcquired ? (
              <>
                <CheckCircle size={16} color="#3B82F6" />
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  Acquired
                </Text>
              </>
            ) : (
              <>
                <Circle size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  Wishlist
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
