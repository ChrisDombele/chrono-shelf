import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../app/lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Define types based on your exact database schema
export interface Watch {
  id: string;
  line: string;
  reference: string;
  price: number;
  link: string;
  image_url: string | null;
  acquired: boolean;
  brand_id: string;
  user_id: string;
}

export interface Brand {
  id: string;
  brand_name: string;
}

export interface WatchWithBrand extends Watch {
  brand?: Brand;
}

export interface UseFetchWatchDataReturn {
  watches: WatchWithBrand[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addWatch: (
    watch: Omit<Watch, 'id' | 'user_id'>
  ) => Promise<{ success: boolean; error?: string; data?: WatchWithBrand }>;
  updateWatch: (
    id: string,
    updates: Partial<Omit<Watch, 'id' | 'user_id'>>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteWatch: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleAcquired: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchBrands: () => Promise<void>;
  addBrand: (
    brandName: string
  ) => Promise<{ success: boolean; error?: string; data?: Brand }>;
  updateBrand: (
    id: string,
    brandName: string
  ) => Promise<{ success: boolean; error?: string; data?: Brand }>;
}

// Custom hook for fetching watch data from Supabase
export const useFetchWatchData = (): UseFetchWatchDataReturn => {
  const [watches, setWatches] = useState<WatchWithBrand[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all brands
  const fetchBrands = useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('brands')
        .select('*')
        .order('brand_name', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      setBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
    }
  }, []);

  // Fetch all watches for the current user with brand information
  const fetchWatches = useCallback(async () => {
    if (!user) {
      setWatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('watches')
        .select(
          `
          *,
          brand:brands!brand_id (
            id,
            brand_name
          )
        `
        )
        .eq('user_id', user.id)
        .order('acquired', { ascending: true }) // Show non-acquired first (wishlist items)
        .order('price', { ascending: false }); // Then by price descending

      if (supabaseError) {
        throw supabaseError;
      }

      setWatches(data || []);
    } catch (err) {
      console.error('Error fetching watches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch watches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add a new watch
  const addWatch = useCallback(
    async (watchData: Omit<Watch, 'id' | 'user_id'>) => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('watches')
          .insert([
            {
              ...watchData,
              user_id: user.id,
            },
          ])
          .select(
            `
          *,
          brand:brands!brand_id (
            id,
            brand_name
          )
        `
          )
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        // Add the new watch to the local state
        setWatches((prev) => [data, ...prev]);
        return { success: true, data };
      } catch (err) {
        console.error('Error adding watch:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to add watch',
        };
      }
    },
    [user]
  );

  // Update an existing watch
  const updateWatch = useCallback(
    async (id: string, updates: Partial<Omit<Watch, 'id' | 'user_id'>>) => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('watches')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select(
            `
          *,
          brand:brands!brand_id (
            id,
            brand_name
          )
        `
          )
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        // Update the local state
        setWatches((prev) =>
          prev.map((watch) => (watch.id === id ? data : watch))
        );
        return { success: true };
      } catch (err) {
        console.error('Error updating watch:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update watch',
        };
      }
    },
    [user]
  );

  // Delete a watch
  const deleteWatch = useCallback(
    async (id: string) => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const { error: supabaseError } = await supabase
          .from('watches')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (supabaseError) {
          throw supabaseError;
        }

        // Remove from local state
        setWatches((prev) => prev.filter((watch) => watch.id !== id));
        return { success: true };
      } catch (err) {
        console.error('Error deleting watch:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete watch',
        };
      }
    },
    [user]
  );

  // Toggle acquired status (useful for wishlist vs collection management)
  const toggleAcquired = useCallback(
    async (id: string) => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const watch = watches.find((w) => w.id === id);
        if (!watch) {
          return { success: false, error: 'Watch not found' };
        }

        const { data, error: supabaseError } = await supabase
          .from('watches')
          .update({ acquired: !watch.acquired })
          .eq('id', id)
          .eq('user_id', user.id)
          .select(
            `
          *,
          brand:brands!brand_id (
            id,
            brand_name
          )
        `
          )
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        // Update the local state
        setWatches((prev) => prev.map((w) => (w.id === id ? data : w)));
        return { success: true };
      } catch (err) {
        console.error('Error toggling acquired status:', err);
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to update acquired status',
        };
      }
    },
    [user, watches]
  );

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([fetchWatches(), fetchBrands()]);
  }, [fetchWatches, fetchBrands]);

  // Add a new brand
  const addBrand = useCallback(
    async (brandName: string) => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        // Check if brand already exists
        const existingBrand = brands.find(
          (b) => b.brand_name.toLowerCase() === brandName.toLowerCase()
        );

        if (existingBrand) {
          return { success: false, error: 'Brand already exists' };
        }

        const { data, error: supabaseError } = await supabase
          .from('brands')
          .insert({ brand_name: brandName.trim() })
          .select()
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        // Update local state
        setBrands((prev) =>
          [...prev, data].sort((a, b) =>
            a.brand_name.localeCompare(b.brand_name)
          )
        );
        return { success: true, data };
      } catch (err) {
        console.error('Error adding brand:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to add brand',
        };
      }
    },
    [user, brands]
  );

  // Update brand name
  const updateBrand = useCallback(
    async (id: string, brandName: string) => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        // Check if new name already exists (excluding current brand)
        const existingBrand = brands.find(
          (b) =>
            b.id !== id &&
            b.brand_name.toLowerCase() === brandName.toLowerCase()
        );

        if (existingBrand) {
          return { success: false, error: 'Brand name already exists' };
        }

        const { data, error: supabaseError } = await supabase
          .from('brands')
          .update({ brand_name: brandName.trim() })
          .eq('id', id)
          .select()
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        // Update local state
        setBrands((prev) =>
          prev
            .map((b) => (b.id === id ? data : b))
            .sort((a, b) => a.brand_name.localeCompare(b.brand_name))
        );
        return { success: true, data };
      } catch (err) {
        console.error('Error updating brand:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update brand',
        };
      }
    },
    [user, brands]
  );

  // Initial fetch and auth state change handling
  useEffect(() => {
    if (user) {
      fetchWatches();
      fetchBrands();
    } else {
      setWatches([]);
      setBrands([]);
      setLoading(false);
    }
  }, [user, fetchWatches, fetchBrands]);

  return {
    watches,
    brands,
    loading,
    error,
    refetch,
    addWatch,
    updateWatch,
    deleteWatch,
    toggleAcquired,
    fetchBrands,
    addBrand,
    updateBrand,
  };
};

// Utility functions for data filtering and sorting
export const useWatchFilters = (watches: WatchWithBrand[]) => {
  const getAcquiredWatches = useCallback(() => {
    return watches.filter((watch) => watch.acquired);
  }, [watches]);

  const getWishlistWatches = useCallback(() => {
    return watches.filter((watch) => !watch.acquired);
  }, [watches]);

  const getWatchesByBrand = useCallback(
    (brandId: string) => {
      return watches.filter((watch) => watch.brand_id === brandId);
    },
    [watches]
  );

  const getTotalValue = useCallback(
    (includeWishlist = false) => {
      const filteredWatches = includeWishlist
        ? watches
        : watches.filter((watch) => watch.acquired);

      return filteredWatches.reduce(
        (total, watch) => total + (watch.price || 0),
        0
      );
    },
    [watches]
  );

  const getWatchesByPriceRange = useCallback(
    (minPrice: number, maxPrice: number) => {
      return watches.filter(
        (watch) => watch.price >= minPrice && watch.price <= maxPrice
      );
    },
    [watches]
  );

  return {
    getAcquiredWatches,
    getWishlistWatches,
    getWatchesByBrand,
    getTotalValue,
    getWatchesByPriceRange,
    totalWatches: watches.length,
    acquiredCount: watches.filter((w) => w.acquired).length,
    wishlistCount: watches.filter((w) => !w.acquired).length,
  };
};

// Input validation utility functions
export const validateRequiredFields = (
  fields: Record<string, any>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  Object.entries(fields).forEach(([fieldName, value]) => {
    if (value === null || value === undefined || value === '') {
      errors.push(
        `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Function to check if input fields are empty and display warnings
export const checkEmptyFieldsAndWarn = (
  fields: Record<string, any>,
  onWarning?: (warnings: string[]) => void
): boolean => {
  const { isValid, errors } = validateRequiredFields(fields);

  if (!isValid && onWarning) {
    onWarning(errors);
  }

  return isValid;
};

// Hook for form validation with real-time feedback
export const useFormValidation = (requiredFields: string[]) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (fieldName: string, value: any) => {
      if (requiredFields.includes(fieldName)) {
        if (value === null || value === undefined || value === '') {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`,
          }));
          return false;
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
          return true;
        }
      }
      return true;
    },
    [requiredFields]
  );

  const validateAllFields = useCallback(
    (formData: Record<string, any>) => {
      const validation = validateRequiredFields(
        Object.fromEntries(
          requiredFields.map((field) => [field, formData[field]])
        )
      );

      if (!validation.isValid) {
        const newErrors: Record<string, string> = {};
        validation.errors.forEach((error) => {
          const fieldName = error.split(' ')[0].toLowerCase();
          newErrors[fieldName] = error;
        });
        setErrors(newErrors);
      } else {
        setErrors({});
      }

      return validation.isValid;
    },
    [requiredFields]
  );

  const markFieldAsTouched = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateAllFields,
    markFieldAsTouched,
    resetValidation,
    hasErrors: Object.keys(errors).length > 0,
  };
};
