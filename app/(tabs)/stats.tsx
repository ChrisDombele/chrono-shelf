import { useFetchWatchData, useWatchFilters } from '@/hooks/fetchWatchData';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Stats() {
  const { watches } = useFetchWatchData();
  const { getTotalValue, acquiredCount } = useWatchFilters(watches);
  return (
    <SafeAreaView className="flex-1">
      <Image
        source={require('@/assets/images/watch.png')}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
    </SafeAreaView>
  );
}
