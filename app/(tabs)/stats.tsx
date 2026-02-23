import { spacing } from '@/constants/Spacing';
import {
  useFetchWatchData,
  useWatchFilters,
  WatchWithBrand,
} from '@/hooks/fetchWatchData';
import {
  Award,
  Clock,
  Crown,
  DollarSign,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icon constants - change these to swap icons across the stats page
const STATS_ICONS = {
  totalValue: DollarSign,
  acquired: Clock,
  avgPrice: TrendingUp,
  brands: Star,
  mostExpensive: Crown,
  mostAffordable: Award,
} as const;

// Format currency without decimals for stats display
function formatCurrencyWhole(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconBgColor: string;
  label: string;
  value: string;
}

function StatCard({ icon: Icon, iconBgColor, label, value }: StatCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 w-full">
      <View className="flex-row gap-4 items-center">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={20} color="#374151" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">{label}</Text>
          <Text className="text-xl font-bold text-gray-900">{value}</Text>
        </View>
      </View>
    </View>
  );
}

interface WatchHighlightCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  title: string;
  watch: WatchWithBrand | null;
}

function WatchHighlightCard({
  icon: Icon,
  iconColor,
  title,
  watch,
}: WatchHighlightCardProps) {
  if (!watch) {
    return (
      <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-0">
        <View className="flex-row items-center mb-3 gap-2">
          <Icon size={20} color={iconColor} />
          <Text className="text-base font-semibold text-gray-900">{title}</Text>
        </View>
        <Text className="text-sm text-gray-500">No watches yet</Text>
      </View>
    );
  }

  const imageUri = watch.image_url || watch.link;

  return (
    <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-0">
      <View className="flex-row items-center mb-3 gap-2">
        <Icon size={20} color={iconColor} />
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-gray-400 text-xl">⌚</Text>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {watch.brand?.brand_name ?? 'Unknown'}
          </Text>
          <Text className="text-lg font-bold text-gray-900">
            {formatCurrencyWhole(watch.price)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function Stats() {
  const { watches } = useFetchWatchData();
  const {
    getTotalValue,
    acquiredCount,
    totalWatches,
    getAcquiredWatches,
    getWishlistWatches,
  } = useWatchFilters(watches);

  //TODO: why use memeo? Why are there calculations here when there are fetchWatchData.tsx calculations?
  const stats = useMemo(() => {
    const totalValue = getTotalValue(true);
    const acquiredValue = getTotalValue(false);
    const wishlistWatches = getWishlistWatches();
    const wishlistValue = wishlistWatches.reduce(
      (sum, w) => sum + (w.price || 0),
      0,
    );
    const uniqueBrandIds = new Set(watches.map((w) => w.brand_id));
    const avgPrice = watches.length > 0 ? totalValue / watches.length : 0;
    const mostExpensive =
      watches.length > 0
        ? [...watches].sort((a, b) => (b.price || 0) - (a.price || 0))[0]
        : null;
    const mostAffordable =
      watches.length > 0
        ? [...watches].sort((a, b) => (a.price || 0) - (b.price || 0))[0]
        : null;
    const acquiredPercent =
      totalValue > 0 ? (acquiredValue / totalValue) * 100 : 0;
    const wishlistPercent =
      totalValue > 0 ? (wishlistValue / totalValue) * 100 : 0;

    return {
      totalValue,
      acquiredValue,
      wishlistValue,
      uniqueBrandCount: uniqueBrandIds.size,
      avgPrice,
      mostExpensive,
      mostAffordable,
      acquiredPercent,
      wishlistPercent,
    };
  }, [watches, getTotalValue, getWishlistWatches]);

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards - 2x2 Grid */}
        <View className="flex-row flex-wrap gap-3 mb-4 items-start">
          <View className="flex-1 min-w-[45%]">
            <StatCard
              icon={STATS_ICONS.totalValue}
              iconBgColor="#D1FAE5"
              label="Total Value"
              value={formatCurrencyWhole(stats.totalValue)}
            />
          </View>
          <View className="flex-1 min-w-[45%]">
            <StatCard
              icon={STATS_ICONS.acquired}
              iconBgColor="#DBEAFE"
              label="Acquired"
              value={`${acquiredCount}/${totalWatches}`}
            />
          </View>
          <View className="flex-1 min-w-[45%]">
            <StatCard
              icon={STATS_ICONS.avgPrice}
              iconBgColor="#E9D5FF"
              label="Avg. Price"
              value={formatCurrencyWhole(stats.avgPrice)}
            />
          </View>
          <View className="flex-1 min-w-[45%]">
            <StatCard
              icon={STATS_ICONS.brands}
              iconBgColor="#FFEDD5"
              label="Brands"
              value={String(stats.uniqueBrandCount)}
            />
          </View>
        </View>

        {/* Most Expensive / Most Affordable */}
        <View className="flex-row gap-3 mb-4">
          <WatchHighlightCard
            icon={STATS_ICONS.mostExpensive}
            iconColor="#D97706"
            title="Most Expensive"
            watch={stats.mostExpensive}
          />
          <WatchHighlightCard
            icon={STATS_ICONS.mostAffordable}
            iconColor="#2563EB"
            title="Most Affordable"
            watch={stats.mostAffordable}
          />
        </View>

        {/* Value Breakdown */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-base font-semibold text-gray-900 mb-4">
            Value Breakdown
          </Text>
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-2xl font-bold text-green-600">
                {formatCurrencyWhole(stats.acquiredValue)}
              </Text>
              <Text className="text-sm text-gray-500">Acquired Value</Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-blue-600">
                {formatCurrencyWhole(stats.wishlistValue)}
              </Text>
              <Text className="text-sm text-gray-500">Wishlist Value</Text>
            </View>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden flex-row">
            <View
              className={`h-full bg-green-500 ${
                stats.acquiredPercent >= 100
                  ? 'rounded-full'
                  : stats.acquiredPercent > 0
                    ? 'rounded-l-full'
                    : ''
              }`}
              style={{
                width: `${stats.acquiredPercent}%`,
              }}
            />
            <View
              className={`h-full bg-blue-200 ${
                stats.wishlistPercent >= 100
                  ? 'rounded-full'
                  : stats.wishlistPercent > 0
                    ? 'rounded-r-full'
                    : ''
              }`}
              style={{
                width: `${stats.wishlistPercent}%`,
              }}
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-600">
              {stats.acquiredPercent.toFixed(1)}% acquired
            </Text>
            <Text className="text-sm text-gray-600">
              {stats.wishlistPercent.toFixed(1)}% wishlist
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
