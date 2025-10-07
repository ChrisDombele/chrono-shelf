import { numberToFormat } from '@/app/utils/conversions';
import { CheckCircle, Circle } from 'lucide-react-native';
import React from 'react';
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
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View className="flex-row items-center">
        {/* Watch Image */}
        <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 mr-4">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 bg-gray-200 items-center justify-center">
              <Text className="text-gray-400 text-2xl">⌚</Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">{brand}</Text>
          <Text className="text-sm text-gray-700 mb-1">{model}</Text>
          <Text className="text-sm text-gray-600 mb-1">{reference}</Text>
          {/* <Text className="text-sm text-gray-600">{year}</Text> */}
        </View>

        {/* Price and Wishlist */}
        <View className="items-end">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {numberToFormat({ number: price, currency: 'USD' })}
          </Text>
          <View className="flex-row items-center">
            {isAcquired ? (
              <>
                <CheckCircle size={16} color="#3B82F6" />
                <Text className="text-sm text-gray-600 ml-2">Acquired</Text>
              </>
            ) : (
              <>
                <Circle size={16} color="#D1D5DB" />
                <Text className="text-sm text-gray-600 ml-2">Wishlist</Text>
              </>
            )}
            <Text className="text-sm text-gray-600"></Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
