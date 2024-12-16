import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../login/Login';
import Register from '../login/Register';
import HomeScreen from '../home/HomeScreen';
import FavoriteScreen from '../favorite/FavoriteScreen'; 
import CustomTabBar from './CustomTabBar';
import Login_Register from '../login/Login_Register';
import HotelDetailScreen from '../detail/HotelDetail';
import BookingScreen from '../booking/BookingScreen';
import BookingListScreen from '../booking/BookingListScreen';
import RoomSearchResults from '../search/RoomSearchResults';
import VoucherScreen from '../voucher/VoucherScreen';
import ProfileScreen from '../profile/ProfileScreen';
import PaymentScreen from '../payment/PaymentScreen';
import VNPayWebView from '../payment/VNPayWebView';
import PaymentSuccess from '../payment/PaymentSuccess';
const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const AuthTabs = () => (
  <Tab.Navigator
    initialRouteName="Login"
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      tabBarStyle: { backgroundColor: 'white' },
      tabBarLabelStyle: { fontSize: 16 },
    }}>
    <Tab.Screen name="Login" component={Login} options={{ tabBarLabel: 'Đăng Nhập' }} />
    <Tab.Screen name="Register" component={Register} options={{ tabBarLabel: 'Đăng Ký' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login_Register"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login_Register" component={Login_Register} />
        <Stack.Screen name="AuthTabs" component={AuthTabs} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
        <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
        <Stack.Screen name="BookingScreen" component={BookingScreen} />
        <Stack.Screen name="BookingListScreen" component={BookingListScreen} />
        <Stack.Screen name="RoomSearchResults" component={RoomSearchResults} />
        <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="VNPayWebView" component={VNPayWebView} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccess}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
