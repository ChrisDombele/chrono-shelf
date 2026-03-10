import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
export interface UploadImageResult {
  success: boolean;
  data?: { url: string };
  error?: string;
}

export interface DeleteImageResult {
  success: boolean;
  error?: string;
}

export const useWatchImages = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Test Supabase connection
  const testConnection = useCallback(async () => {
    try {
      console.log('🔍 Testing Supabase connection...');

      // Method 1: Try to list buckets (might not work in all configs)
      try {
        const { data: bucketsData, error: bucketsError } =
          await supabase.storage.listBuckets();
        if (bucketsError) {
          console.log('⚠️ listBuckets failed:', bucketsError.message);
        } else {
          console.log('✅ Supabase connected successfully');
          console.log(
            '📦 Available buckets:',
            bucketsData?.map((b) => b.name),
          );

          // Check if watch-images bucket exists
          const watchImagesBucket = bucketsData?.find(
            (b) => b.name === 'watch-images',
          );
          if (watchImagesBucket) {
            console.log('✅ watch-images bucket found');
            return true;
          }
        }
      } catch (bucketsErr) {
        console.log('⚠️ listBuckets error:', bucketsErr);
      }

      // Method 2: Try to access the specific bucket directly
      console.log('🔍 Trying direct bucket access...');
      try {
        const { data: filesData, error: filesError } = await supabase.storage
          .from('watch-images')
          .list('', { limit: 1 });

        if (filesError) {
          if (
            filesError.message.includes('bucket') ||
            filesError.message.includes('not found')
          ) {
            console.error('❌ watch-images bucket does not exist');
            console.log('💡 You need to create the bucket first');
            return false;
          } else {
            console.log('✅ watch-images bucket exists (but might be empty)');
            return true;
          }
        } else {
          console.log('✅ watch-images bucket exists and is accessible');
          return true;
        }
      } catch (directErr) {
        console.error('❌ Direct bucket access failed:', directErr);
        return false;
      }
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      return false;
    }
  }, []);

  // Get image URL from storage
  const getImageUrl = useCallback(
    async (filePath: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase.storage
          .from('watch-images')
          .download(filePath);

        if (error || !data) {
          console.error('Error downloading image:', error);
          return null;
        }

        // Convert FileObject to base64 data URL for display
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(data);
        });
      } catch (error) {
        console.error('Error getting image URL:', error);
        return null;
      }
    },
    [],
  );

  // Upload a new image
  const uploadImage = useCallback(
    async (
      watchId: string,
      imageUri: string,
      imageName?: string,
    ): Promise<UploadImageResult> => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setUploading(true);
      console.log('🔄 Starting upload for:', imageUri[0]);

      try {
        // Generate unique filename
        const fileName = imageName || `watch_${watchId}.jpg`;
        const filePath = `${user.id}/${watchId}/${fileName}`;

        const { data: supabaseUploadData, error: uploadError } =
          await supabase.storage
            .from('watch-images')
            .upload(filePath, imageUri);

        if (uploadError) {
          console.error('❌ Upload error details:', uploadError);

          // Provide more specific error messages
          if (uploadError.message.includes('exceeded')) {
            throw new Error(
              'Image file is too large. Please choose a smaller image.',
            );
          } else if (uploadError.message.includes('bucket')) {
            throw new Error(
              'Storage bucket not found. Please contact support.',
            );
          } else if (uploadError.message.includes('permission')) {
            throw new Error(
              'Permission denied. Please check your authentication.',
            );
          }

          throw uploadError;
        }

        console.log('✅ Upload successful:', supabaseUploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('watch-images')
          .getPublicUrl(filePath);

        console.log('🔗 Public URL generated:', urlData.publicUrl);

        setUploading(false);
        return { success: true, data: { url: urlData.publicUrl } };
      } catch (error) {
        setUploading(false);
        console.error('❌ Error uploading image:', error);

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload image';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [user],
  );

  // Pick image from camera or gallery
  const pickImage = useCallback(async (): Promise<string | null> => {
    try {
      // Request permissions

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          throw new Error('Camera and gallery permissions not granted');
        }
      }

      // Launch image picker with optimized settings
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6, // Reduced quality to decrease file size
        exif: false, // Remove EXIF data to reduce size
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('🔍 Picked image:', result.assets[0].uri);
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }, []);

  // Take photo with camera
  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      // Request camera permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Camera permission not granted');
        }
      }

      // Launch camera with optimized settings
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6, // Reduced quality to decrease file size
        exif: false, // Remove EXIF data to reduce size
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }, []);

  // Simple delete function for storage cleanup (if needed)
  const deleteImage = useCallback(
    async (filePath: string): Promise<DeleteImageResult> => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setDeleting(true);

      try {
        const { error: storageError } = await supabase.storage
          .from('watch-images')
          .remove([filePath]);

        if (storageError) {
          throw storageError;
        }

        setDeleting(false);
        return { success: true };
      } catch (error) {
        setDeleting(false);
        console.error('Error deleting image:', error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to delete image',
        };
      }
    },
    [user],
  );

  return {
    // State
    uploading,
    deleting,

    // Functions
    uploadImage,
    pickImage,
    takePhoto,
    deleteImage,
    getImageUrl,
    testConnection,
  };
};
