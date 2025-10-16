import { useAuth } from '@/contexts/AuthContext';
import { useFetchWatchData } from '@/hooks/fetchWatchData';
import { useWatchImages } from '@/hooks/useWatchImages';
import { router } from 'expo-router';
import { Upload, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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

  const handleDeleteImage = () => {
    setNewImageFile(null);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 px-4"
      edges={['top', 'left', 'right']}
    >
      <KeyboardAwareScrollView
        bottomOffset={16}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* <ScrollView className="flex-1" showsVerticalScrollIndicator={false}> */}
        {/* Watch Image */}
        <View className="my-6">
          <TouchableOpacity
            onPress={handleAddPhoto}
            className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white items-center justify-center"
          >
            {newImageFile ? (
              <Image
                source={{ uri: newImageFile }}
                className="w-full h-full rounded-xl"
                resizeMode="center"
              />
            ) : (
              <View className="items-center">
                <Upload size={28} color="#9CA3AF" className="mb-2" />
                <Text className="text-blue-600 font-medium">Add Photo</Text>
              </View>
            )}

            {/* Remove Image Button */}
            {newImageFile && (
              <TouchableOpacity
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                onPress={handleDeleteImage}
              >
                <X size={16} color="white" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="gap-2">
          {/* Brand */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Brand <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
              value={watchData.brand}
              onChangeText={(value) => handleInputChange('brand', value)}
              placeholder="Enter brand name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Model */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Model <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
              value={watchData.model}
              onChangeText={(value) => handleInputChange('model', value)}
              placeholder="Enter model name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Price */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Price <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
              value={watchData.price}
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
              value={watchData.reference}
              onChangeText={(value) => handleInputChange('reference', value)}
              placeholder="Enter reference number"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Website Link */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Website Link</Text>
            <TextInput
              className="w-full h-12 px-4 bg-gray-100 rounded-xl text-gray-900"
              value={watchData.link}
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
                value={watchData.acquired}
                onValueChange={(value) =>
                  setWatchData((prev) => ({ ...prev, acquired: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={watchData.acquired ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
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
        {/* </ScrollView> */}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddWatchPage;
