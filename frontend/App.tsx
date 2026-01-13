import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import FundraisersScreen from './src/screens/FundraisersScreen';
import FundraiserDetailScreen from './src/screens/FundraiserDetailScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFD700',
            },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Fundraisers" 
            component={FundraisersScreen}
            options={{ title: 'Givebutter Fundraisers' }}
          />
          <Stack.Screen 
            name="FundraiserDetail" 
            component={FundraiserDetailScreen}
            options={{ title: 'Fundraiser Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

