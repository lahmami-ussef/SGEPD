import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScreensListScreen from '../screens/ScreensListScreen';
import TicketsListScreen from '../screens/TicketsListScreen';
import CreateTicketScreen from '../screens/CreateTicketScreen';
import ClientsListScreen from '../screens/ClientsListScreen';
import LocationsListScreen from '../screens/LocationsListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingSpinner from '../components/LoadingSpinner';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack séparé pour Tickets (contient CreateTicket)
const TicketsStack = createStackNavigator();
function TicketsNavigator() {
  return (
    <TicketsStack.Navigator screenOptions={{ headerShown: true }}>
      <TicketsStack.Screen
        name="TicketsList"
        component={TicketsListScreen}
        options={{ title: 'Tickets' }}
      />
      <TicketsStack.Screen
        name="CreateTicket"
        component={CreateTicketScreen}
        options={{ title: 'Nouveau ticket' }}
      />
    </TicketsStack.Navigator>
  );
}

function MainTabs() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Écrans') iconName = focused ? 'desktop' : 'desktop-outline';
          else if (route.name === 'Tickets') iconName = focused ? 'ticket' : 'ticket-outline';
          else if (route.name === 'Clients') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Localisations') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Écrans" component={ScreensListScreen} />
      {/* ✅ Tickets est maintenant un Stack — CreateTicket est accessible */}
      <Tab.Screen name="Tickets" component={TicketsNavigator} />
      {isAdmin && <Tab.Screen name="Clients" component={ClientsListScreen} />}
      {isAdmin && <Tab.Screen name="Localisations" component={LocationsListScreen} />}
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const loadStoredUser = useAuthStore((state) => state.loadStoredUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => !!state.user);

  useEffect(() => {
    loadStoredUser();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}