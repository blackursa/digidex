import React from 'react';
import { View, Text, Button } from 'react-native';
import type { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'Settings'>;

export const SimpleSettingsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Settings</Text>
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};
