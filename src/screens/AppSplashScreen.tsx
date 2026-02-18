import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export const AppSplashScreen = () => (
  <View style={styles.container}>
    <Image
      source={require('../../assets/spash.jpeg')}
      style={styles.image}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
});
