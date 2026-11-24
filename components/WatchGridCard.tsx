import { numberToFormat } from '@/utils/conversions';
import { CheckCircle, Watch } from 'lucide-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface WatchGridCardProps {
  brand: string;
  model: string;
  imageUrl?: string;
  price: number;
  isAcquired?: boolean;
  onPress?: () => void;
}

export default function WatchGridCard({
  brand,
  model,
  imageUrl,
  price,
  isAcquired,
  onPress,
}: WatchGridCardProps) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View className="aspect-square bg-gray-100 dark:bg-gray-700 items-center justify-center">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Watch size={48} color="#9CA3AF" strokeWidth={1} />
        )}
        {isAcquired && (
          <View className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/80 rounded-full p-1">
            <CheckCircle size={16} color="#16A34A" />
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-sm font-bold text-gray-900 dark:text-white" numberOfLines={1}>
          {brand}
        </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1" numberOfLines={1}>
          {model}
        </Text>
        <Text className="text-sm font-bold text-gray-900 dark:text-white">
          {numberToFormat({ number: price, currency: 'USD' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
