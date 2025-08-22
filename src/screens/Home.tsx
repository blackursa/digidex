import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Layout } from '../components/Layout';

export function HomeScreen() {
  return (
    <Layout style={styles.container}>
      <Text style={styles.title}>Welcome to DigiDex</Text>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
