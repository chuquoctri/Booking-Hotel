import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';

// Đường dẫn chính xác đến ảnh
const backgroundImage = require('../assets/Login_Register.jpg');

const Login_Register = ({navigation}) => {
  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.TitleText}>BOOKING HOTEL</Text>
        <Text style={styles.Text}>
          Your Digital Companion for Travel Experiences
        </Text>
        <Text style={styles.Text}>Travel Experiences</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AuthTabs')}>
            <Text style={styles.buttonText}>
              Login with Email/ Phone number
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button_register}
            onPress={() =>
              navigation.navigate('AuthTabs', {screen: 'Register'})
            }>
            <Text style={styles.buttonText_register}>Register</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.LowText}>Don't have an account? Sign Up</Text>
        <Text style={styles.LowText}>
          By continuing, you agree to our Terms of Service
        </Text>
        <Text style={styles.LowText}>and Privacy Policy</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 400,
  },
  button: {
    backgroundColor: '#15c2ad',
    padding: 10,
    margin: 10,
    borderRadius: 15,
  },
  button_register: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonText_register: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  TitleText: {
    color: '#fff',
    fontSize: 30,
    marginBottom: 15,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  Text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  LowText: {
    color: '#fff',
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default Login_Register;
