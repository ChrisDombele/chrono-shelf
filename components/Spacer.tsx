import { spacing } from '@/constants/Spacing';
import React from 'react';
import { View } from 'react-native';

interface Props {
  size: keyof typeof spacing;
}

const Spacer = ({ size }: Props) => {
  return <View style={{ height: spacing[size] }} />;
};

export default Spacer;
