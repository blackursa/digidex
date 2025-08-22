import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { ScanHistoryScreen } from '../screens/ScanHistoryScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanHistory"
        component={ScanHistoryScreen}
        options={{ 
          title: 'Scan History',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};
