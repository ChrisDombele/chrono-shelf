import React from 'react';
import { StyleSheet, View } from 'react-native';
import Auth from '../components/Auth';

export default function SignIn() {
  return (
    <View style={styles.container}>
      <Auth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
