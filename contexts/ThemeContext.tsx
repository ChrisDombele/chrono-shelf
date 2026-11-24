import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: async () => {},
});

const THEME_KEY = '@chrono_shelf_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // NativeWind's color scheme is the single source of truth; mirroring it in
  // separate React state causes overlapping renders and update-before-mount warnings.
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      const scheme = saved === 'dark' ? 'dark' : 'light';
      if (scheme !== colorScheme) {
        setColorScheme(scheme);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDarkMode = async () => {
    const next = isDarkMode ? 'light' : 'dark';
    setColorScheme(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
