import { useAuth } from '@/contexts/AuthContext';
import { useFetchWatchData, WatchWithBrand } from '@/hooks/fetchWatchData';
import { useWatchImages } from '@/hooks/useWatchImages';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { supabase } from '../lib/supabase';
import { saveWatch } from '../utils/watchOperations';

export default function EditWatchPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { watches, updateWatch, addWatch, addBrand, updateBrand } = useFetchWatchData();
  const { uploadImage, pickImage, takePhoto, deleteImage, uploading } =
    useWatchImages();

  const [watch, setWatch] = useState<WatchWithBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    price: '',
    reference: '',
    link: '',
    image_url: '',
    acquired: false,
  });

  // Image state
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImageFile, setnewImageFile] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const { refetch } = useFetchWatchData();

  // Refresh data when screen comes into focus (e.g., after editing a watch)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Load watch data
  useEffect(() => {
    if (id && watches.length > 0) {
      const foundWatch = watches.find((w) => w.id === id);

      if (foundWatch) {
        setWatch(foundWatch);
        setFormData({
          brand: foundWatch.brand?.brand_name || '',
          model: foundWatch.line || '',
          price: foundWatch.price?.toString() || '',
          reference: foundWatch.reference || '',
          link: foundWatch.link || '',
          image_url: foundWatch.image_url || '',
          acquired: foundWatch.acquired || false,
        });

        // Load the actual image from Supabase storage if it exists
        if (foundWatch.image_url) {
          loadImageFromStorage(foundWatch.image_url);
        } else {
          setCurrentImage(null);
        }

        // Reset image removed flag if there's an existing image
        setImageRemoved(false);
      }
      setLoading(false);
    }
  }, [id, watches]);

  // Load image from Supabase storage
  const loadImageFromStorage = async (imageUrl: string) => {
    try {
      console.log('🔍 Original image URL:', imageUrl);

      // Extract file path from the image URL
      // The URL structure is: https://.../storage/v1/object/public/watch-images/{user_id}/{watch_id}/{filename}
      const urlParts = imageUrl.split('/');
      console.log('🔍 URL parts:', urlParts);

      // Find the index of 'watch-images' in the URL
      const bucketIndex = urlParts.findIndex((part) => part === 'watch-images');
      console.log('🔍 Bucket index:', bucketIndex);

      if (bucketIndex === -1) {
        console.error('Invalid image URL structure');
        setCurrentImage(null);
        return;
      }

      // Extract the path after 'watch-images'
      const pathAfterBucket = urlParts.slice(bucketIndex + 1);
      console.log('🔍 Path after bucket:', pathAfterBucket);

      if (pathAfterBucket.length < 3) {
        console.error('Invalid path structure after bucket');
        setCurrentImage(null);
        return;
      }

      const [userId, watchId, fileName] = pathAfterBucket;
      const filePath = `${userId}/${watchId}/${fileName}`;

      console.log('🔍 Loading image from path:', filePath);

      const { data } = await supabase.storage
        .from('watch-images')
        .getPublicUrl(filePath);
      console.log('🔍 Public URL:', data?.publicUrl);

      if (data?.publicUrl) {
        setCurrentImage(data.publicUrl);
      } else {
        setCurrentImage(null);
      }
    } catch (error) {
      console.error('Error loading image from storage:', error);
      setCurrentImage(null);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If image_url is cleared, also clear the current image state
    if (field === 'image_url' && !value) {
      setCurrentImage(null);
    }
  };

  // Handle acquired toggle
  const handleAcquiredToggle = (value: boolean) => {
    setFormData((prev) => ({ ...prev, acquired: value }));
  };

  // Handle image pick from gallery
  const handlePickImage = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setnewImageFile(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  // Handle taking photo
  const handleTakePhoto = async () => {
    try {
      const imageUri = await takePhoto();
      if (imageUri) {
        setnewImageFile(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setnewImageFile(null);
    setCurrentImage(null);
    // Clear the image_url in form data as well
    setFormData((prev) => ({ ...prev, image_url: '' }));
    setImageRemoved(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!watch || !user) return;

    setSaving(true);

    try {
      await saveWatch({
        watch,
        formData: {
          brand: formData.brand,
          model: formData.model,
          price: formData.price,
          reference: formData.reference,
          link: formData.link,
          acquired: formData.acquired,
        },
        user,
        watches,
        newImageFile,
        currentImage,
        imageRemoved,
        addBrand,
        updateWatch,
        uploadImage,
        deleteImage,
        onSuccess: () => {
          setImageRemoved(false);
          router.back();
        },
        onError: (error) => {
          console.error('Failed to save watch:', error);
        },
      });
    } catch (error) {
      console.error('Error in handleSave:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: router.back },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!watch) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-xl text-center mb-4">
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
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            onPress={handleBack}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Edit Watch</Text>
            <Text className="text-gray-500 text-sm">Enter watch details</Text>
          </View>
        </View>

        {/* Watch Image Section */}
        <View className="p-4">
          <View>
            <Text className="text-gray-700 font-medium mb-3">Watch Image</Text>

            <View className="relative">
              <View className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center">
                {currentImage || newImageFile ? (
                  <Image
                    source={{ uri: newImageFile || currentImage || '' }}
                    className="w-full h-full rounded-xl"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <Text className="text-gray-400 text-lg mb-2">
                      Watch preview
                    </Text>
                    <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
                      <Text className="text-gray-400 text-2xl">📷</Text>
                    </View>
                  </View>
                )}

                {/* Remove Image Button */}
                {(currentImage || newImageFile) && (
                  <TouchableOpacity
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                    onPress={handleRemoveImage}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Image Action Buttons */}
              <View className="flex-row mt-3 space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-blue-500 py-3 rounded-xl items-center"
                  onPress={handlePickImage}
                  disabled={uploading}
                >
                  <Text className="text-white font-semibold">
                    {uploading ? 'Uploading...' : 'Pick Image'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-gray-500 py-3 rounded-xl items-center"
                  onPress={handleTakePhoto}
                  disabled={uploading}
                >
                  <Text className="text-white font-semibold">Take Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            {/* Brand */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Brand *</Text>
              <TextInput
                className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
                value={formData.brand}
                onChangeText={(value) => handleInputChange('brand', value)}
                placeholder="Enter brand name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Model */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Model *</Text>
              <TextInput
                className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
                value={formData.model}
                onChangeText={(value) => handleInputChange('model', value)}
                placeholder="Enter model name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Price */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Price *</Text>
              <TextInput
                className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            {/* Reference */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Reference</Text>
              <TextInput
                className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
                value={formData.reference}
                onChangeText={(value) => handleInputChange('reference', value)}
                placeholder="Enter reference number"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Website Link */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">
                Website Link
              </Text>
              <TextInput
                className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
                value={formData.link}
                onChangeText={(value) => handleInputChange('link', value)}
                placeholder="https://..."
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* Acquired Status */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Acquired</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">Do you own this watch?</Text>
                <Switch
                  value={formData.acquired}
                  onValueChange={handleAcquiredToggle}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor={formData.acquired ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-gray-200 flex-row gap-4">
        <TouchableOpacity
          className="flex-1 bg-white border border-gray-300 py-4 rounded-xl items-center"
          onPress={handleCancel}
          disabled={saving}
        >
          <Text className="text-gray-700 font-semibold">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-blue-500 py-4 rounded-xl items-center flex-row justify-center"
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white font-semibold ml-2">
            {saving ? 'Updating...' : 'Update'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
