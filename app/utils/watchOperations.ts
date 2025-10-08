import { Alert } from 'react-native';
import { Watch, Brand, WatchWithBrand } from '../../hooks/fetchWatchData';

interface WatchFormData {
  brand: string;
  model: string;
  price: string;
  reference: string;
  link: string;
  acquired: boolean;
}

interface User {
  id: string;
}

interface SaveWatchOptions {
  watch?: WatchWithBrand; // Optional for new watches
  formData: WatchFormData;
  user: User;
  watches: WatchWithBrand[];
  newImageFile: string | null;
  currentImage: string | null;
  imageRemoved: boolean;
  addBrand: (brandName: string) => Promise<{ success: boolean; data?: Brand; error?: string }>;
  updateWatch: (watchId: string, data: Partial<Omit<Watch, 'id' | 'user_id'>>) => Promise<{ success: boolean; error?: string }>;
  uploadImage: (watchId: string, imageUri: string) => Promise<{ success: boolean; data?: { url: string }; error?: string }>;
  deleteImage: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  createWatch?: (data: Omit<Watch, 'id' | 'user_id'>) => Promise<{ success: boolean; data?: WatchWithBrand; error?: string }>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const saveWatch = async ({
  watch,
  formData,
  user,
  watches,
  newImageFile,
  currentImage,
  imageRemoved,
  addBrand,
  updateWatch,
  uploadImage,
  deleteImage,
  createWatch,
  onSuccess,
  onError,
}: SaveWatchOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!user) {
      const error = 'User not authenticated';
      Alert.alert('Error', error);
      onError?.(error);
      return { success: false, error };
    }

    // Validate required fields
    if (
      !formData.brand.trim() ||
      !formData.model.trim() ||
      !formData.price.trim()
    ) {
      const error = 'Please fill in all required fields';
      Alert.alert('Error', error);
      onError?.(error);
      return { success: false, error };
    }

    // Validate price
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      const error = 'Please enter a valid price';
      Alert.alert('Error', error);
      onError?.(error);
      return { success: false, error };
    }

    let brandId: string;
    const newBrandName = formData.brand.trim();
    let watchId = watch?.id;

    // Handle brand logic
    if (watch && watch.brand?.brand_name !== newBrandName) {
      // Updating existing watch with different brand
      const existingBrand = watches.find(
        (w) => w.brand?.brand_name === newBrandName
      )?.brand;

      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const brandResult = await addBrand(newBrandName);
        if (brandResult.success && brandResult.data) {
          brandId = brandResult.data.id;
        } else {
          throw new Error(brandResult.error || 'Failed to create brand');
        }
      }
    } else if (watch) {
      // Existing watch with same brand
      brandId = watch.brand_id;
    } else {
      // New watch
      const existingBrand = watches.find(
        (w) => w.brand?.brand_name === newBrandName
      )?.brand;

      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const brandResult = await addBrand(newBrandName);
        if (brandResult.success && brandResult.data) {
          brandId = brandResult.data.id;
        } else {
          throw new Error(brandResult.error || 'Failed to create brand');
        }
      }
    }

    const watchData: Omit<Watch, 'id' | 'user_id'> = {
      line: formData.model.trim(),
      price: price,
      reference: formData.reference.trim(),
      link: formData.link.trim(),
      acquired: formData.acquired,
      brand_id: brandId,
      image_url: null, // Will be updated separately if there's an image
    };

    // Create or update watch
    let updateResult;
    if (watch) {
      updateResult = await updateWatch(watch.id, watchData);
    } else if (createWatch) {
      updateResult = await createWatch(watchData);
      if (updateResult.success && updateResult.data) {
        watchId = updateResult.data.id;
      }
    } else {
      throw new Error('No create function provided for new watch');
    }

    if (!updateResult.success) {
      throw new Error(updateResult.error || 'Failed to save watch');
    }

    // Handle image operations
    if (newImageFile && watchId) {
      // Upload new image
      try {
        const imageResult = await uploadImage(watchId, newImageFile);
        if (!imageResult.success) {
          Alert.alert(
            'Image Upload Warning',
            `Watch saved but image upload failed: ${imageResult.error}. You can try uploading the image again later.`,
            [{ text: 'OK' }]
          );
        } else {
          // Update the watch with the new image URL
          const imageUpdateResult = await updateWatch(watchId, {
            image_url: imageResult.data?.url,
          });
          if (!imageUpdateResult.success) {
            console.warn('Failed to update watch with image URL');
          }
        }
      } catch (uploadError) {
        Alert.alert(
          'Image Upload Error',
          `Watch saved but image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}. You can try uploading the image again later.`,
          [{ text: 'OK' }]
        );
      }
    } else if (watch && ((currentImage && !newImageFile) || imageRemoved)) {
      // Remove existing image
      try {
        // Delete from storage first
        if (currentImage && currentImage.startsWith('data:')) {
          if (watch.image_url) {
            const urlParts = watch.image_url.split('/');
            const bucketIndex = urlParts.findIndex(
              (part) => part === 'watch-images'
            );
            if (bucketIndex !== -1) {
              const pathAfterBucket = urlParts.slice(bucketIndex + 1);
              if (pathAfterBucket.length >= 3) {
                const [userId, watchId, fileName] = pathAfterBucket;
                const filePath = `${userId}/${watchId}/${fileName}`;

                const deleteResult = await deleteImage(filePath);
                if (!deleteResult.success) {
                  console.warn('Failed to delete image from storage');
                }
              }
            }
          }
        }

        // Update watch record to remove image reference
        const imageUpdateResult = await updateWatch(watch.id, {
          image_url: null,
        });
        if (!imageUpdateResult.success) {
          console.warn('Failed to update watch with null image URL');
        }
      } catch (removeError) {
        Alert.alert(
          'Image Removal Error',
          `Watch saved but image removal failed: ${removeError instanceof Error ? removeError.message : 'Unknown error'}. You can try removing the image again later.`,
          [{ text: 'OK' }]
        );
      }
    }

    const successMessage = watch ? 'Watch updated successfully' : 'Watch created successfully';
    Alert.alert('Success', successMessage, [
      { text: 'OK', onPress: onSuccess },
    ]);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save watch';
    Alert.alert('Error', errorMessage);
    onError?.(errorMessage);
    return { success: false, error: errorMessage };
  }
};