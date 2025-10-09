import { useAuth } from '@/contexts/AuthContext';
import { useFetchWatchData } from '@/hooks/fetchWatchData';
import { useWatchImages } from '@/hooks/useWatchImages';
import { router } from 'expo-router';
import { Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveWatch } from '../utils/watchOperations';

const AddWatchPage = () => {
  const { user } = useAuth();
  const { watches, addWatch, addBrand } = useFetchWatchData();
  const { uploadImage, pickImage, takePhoto, deleteImage } = useWatchImages();

  const [watchData, setWatchData] = useState({
    brand: '',
    model: '',
    price: '',
    reference: '',
    link: '', // Changed from websiteLink to match the Watch interface
    acquired: false,
  });

  const [newImageFile, setNewImageFile] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setWatchData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddWatch = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a watch');
      return;
    }

    setSaving(true);

    try {
      await saveWatch({
        formData: {
          brand: watchData.brand,
          model: watchData.model,
          price: watchData.price,
          reference: watchData.reference,
          link: watchData.link,
          acquired: watchData.acquired,
        },
        user,
        watches,
        newImageFile,
        currentImage: null,
        imageRemoved: false,
        addBrand,
        updateWatch: async () => ({ success: true }), // Not used for new watches
        uploadImage,
        deleteImage,
        createWatch: addWatch,
        onSuccess: () => {
          // Reset form
          setWatchData({
            brand: '',
            model: '',
            price: '',
            reference: '',
            link: '',
            acquired: false,
          });
          setNewImageFile(null);
          router.back();
        },
        onError: (error) => {
          console.error('Failed to add watch:', error);
        },
      });
    } catch (error) {
      console.error('Error in handleAddWatch:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Choose photo source', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Gallery', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePickImage = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setNewImageFile(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const imageUri = await takePhoto();
      if (imageUri) {
        setNewImageFile(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Watch Image */}
        <View className="my-6">
          <TouchableOpacity
            onPress={handleAddPhoto}
            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-white items-center justify-center"
          >
            {newImageFile ? (
              <Image
                source={{ uri: newImageFile }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Upload size={28} color="#9CA3AF" className="mb-2" />
                <Text className="text-blue-600 font-medium">Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          {/* Brand and Model Row */}
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Brand <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-900"
                placeholder="e.g. Rolex"
                placeholderTextColor="#9CA3AF"
                value={watchData.brand}
                onChangeText={(value) => handleInputChange('brand', value)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Model <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-900"
                placeholder="e.g. Submariner"
                placeholderTextColor="#9CA3AF"
                value={watchData.model}
                onChangeText={(value) => handleInputChange('model', value)}
              />
            </View>
          </View>

          {/* Price */}
          <View>
            <Text className="text-base font-medium text-gray-900 mb-2">
              Price <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl">
              <Text className="text-gray-600 pl-4 pr-1 text-base">$</Text>
              <TextInput
                className="flex-1 py-3 pr-4 text-base text-gray-900"
                placeholder="8995"
                placeholderTextColor="#9CA3AF"
                value={watchData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Reference */}
          <View>
            <Text className="text-base font-medium text-gray-900 mb-2">
              Reference
            </Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-900"
              placeholder="e.g. 114060"
              placeholderTextColor="#9CA3AF"
              value={watchData.reference}
              onChangeText={(value) => handleInputChange('reference', value)}
            />
          </View>

          {/* Website Link */}
          <View>
            <Text className="text-base font-medium text-gray-900 mb-2">
              Website Link
            </Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-900"
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
              value={watchData.link}
              onChangeText={(value) => handleInputChange('link', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Acquired Toggle */}
          <View className="flex-row items-center justify-between py-4">
            <View>
              <Text className="text-base font-medium text-gray-900">
                Acquired
              </Text>
              <Text className="text-sm text-gray-600">
                Do you own this watch?
              </Text>
            </View>
            <Switch
              value={watchData.acquired}
              onValueChange={(value) =>
                setWatchData((prev) => ({ ...prev, acquired: value }))
              }
              trackColor={{ false: '#F3F4F6', true: '#3B82F6' }}
              thumbColor={watchData.acquired ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#F3F4F6"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-8 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 py-4 rounded-xl border border-gray-300 items-center"
          >
            <Text className="text-base font-medium text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddWatch}
            disabled={saving}
            className={`flex-1 py-4 rounded-xl items-center flex-row justify-center ${
              saving ? 'bg-blue-400' : 'bg-blue-600'
            }`}
          >
            <Text className="text-base font-medium text-white">
              {saving ? 'Adding...' : 'Add Watch'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddWatchPage;
