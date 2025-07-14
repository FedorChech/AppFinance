import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExpensesScreen from './src/screens/ExpensesScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Траты"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName = '';
              if (route.name === 'Траты') {
                iconName = 'wallet';
              } else if (route.name === 'Категории') {
                iconName = 'list';
              } else if (route.name === 'Аналитика') {
                iconName = 'pie-chart';
              }
              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1976d2',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Траты" component={ExpensesScreen} />
          <Tab.Screen name="Категории" component={CategoriesScreen} />
          <Tab.Screen name="Аналитика" component={AnalyticsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
