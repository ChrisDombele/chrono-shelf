import { Stack } from 'expo-router';

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="accountPage"
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
        }}
      />
    </Stack>
  );
};

export default StackLayout;
