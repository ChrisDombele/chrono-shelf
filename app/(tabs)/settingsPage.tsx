import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Database,
  Download,
  EyeOff,
  HelpCircle,
  Moon,
  Star,
  Trash2,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const { session } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  const iconColor = isDarkMode ? '#9CA3AF' : '#666';

  const handleExportData = () => {
    Alert.alert(
      'Export Collection Data',
      'This feature will export your watch collection data.',
      [{ text: 'OK' }],
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive' },
      ],
    );
  };

  const handleHelpFAQ = () => {
    Alert.alert('Help & FAQ', 'Help documentation would open here.');
  };

  const handleRateApp = () => {
    Alert.alert('Rate the App', 'App store rating would open here.');
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      edges={['top', 'left', 'right']}
    >
      <ScrollView className="flex-1">
        {/* Appearance Section */}
        <View className="bg-white dark:bg-gray-800 m-4 rounded-lg shadow-sm">
          <View className="flex-row items-center p-4 gap-2">
            <Moon size={20} color={iconColor} />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Appearance
            </Text>
          </View>
          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View>
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                Dark Mode
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View className="bg-white dark:bg-gray-800 m-4 rounded-lg shadow-sm">
          <View className="flex-row items-center p-4 gap-2">
            <User size={20} color={iconColor} />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Account
            </Text>
          </View>
          <Link href="/settings/accountPage" push asChild>
            <TouchableOpacity className="flex-row items-center justify-between pl-4 pr-4 pb-4">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-semibold text-lg">W</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    Watch Collector
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {session?.user?.email || 'collector@example.com'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={isDarkMode ? '#6B7280' : '#ccc'} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Preferences Section */}
        <View className="bg-white dark:bg-gray-800 m-4 rounded-lg shadow-sm">
          <View className="flex-row items-center p-4 gap-2">
            <User size={20} color={iconColor} />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Preferences
            </Text>
          </View>

          <View className="flex-row items-center justify-between pl-4 pr-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center flex-1 gap-2">
              <Bell size={20} color={iconColor} />
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  Push Notifications
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Get notified about price changes
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1 gap-2">
              <EyeOff size={20} color={iconColor} />
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  Privacy Mode
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Hide prices in screenshots
                </Text>
              </View>
            </View>
            <Switch
              value={privacyMode}
              onValueChange={setPrivacyMode}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View className="bg-white dark:bg-gray-800 m-4 rounded-lg shadow-sm">
          <View className="flex-row items-center p-4 gap-2">
            <Database size={20} color={iconColor} />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Management
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center pl-4 pr-4 pb-4 border-b border-gray-100 dark:border-gray-700 gap-2"
            onPress={handleExportData}
          >
            <Download size={20} color={iconColor} />
            <Text className="text-base font-medium text-gray-900 dark:text-white flex-1">
              Export Collection Data
            </Text>
            <ChevronRight size={16} color={isDarkMode ? '#6B7280' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 gap-2"
            onPress={handleClearData}
          >
            <Trash2 size={20} color="#EF4444" />
            <Text className="text-base font-medium text-red-500 flex-1">
              Clear All Data
            </Text>
            <ChevronRight size={16} color={isDarkMode ? '#6B7280' : '#ccc'} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View className="bg-white dark:bg-gray-800 m-4 rounded-lg shadow-sm">
          <View className="flex-row items-center p-4 gap-2">
            <HelpCircle size={20} color={iconColor} />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Support
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center pl-4 pr-4 pb-4 border-b border-gray-100 dark:border-gray-700 gap-2"
            onPress={handleHelpFAQ}
          >
            <HelpCircle size={20} color={iconColor} />
            <Text className="text-base font-medium text-gray-900 dark:text-white flex-1">
              Help & FAQ
            </Text>
            <ChevronRight size={16} color={isDarkMode ? '#6B7280' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 gap-2"
            onPress={handleRateApp}
          >
            <Star size={20} color={iconColor} />
            <Text className="text-base font-medium text-gray-900 dark:text-white flex-1">
              Rate the App
            </Text>
            <ChevronRight size={16} color={isDarkMode ? '#6B7280' : '#ccc'} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="bg-white dark:bg-gray-800 m-4 mb-8 rounded-lg shadow-sm">
          <View className="items-center py-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Watch Vault
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Version 1.0.0
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              © 2026 Chrono Shelf. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
