import { useFetchWatchData, useWatchFilters } from '@/hooks/fetchWatchData';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Stats() {
  const { watches } = useFetchWatchData();
  const { getTotalValue, acquiredCount } = useWatchFilters(watches);
  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center">
        <Text>Statistics page coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}
