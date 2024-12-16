import React, {useState} from 'react';
import url from '../../ipconfig';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Số điện thoại hoặc email
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Trạng thái loading

  const navigation = useNavigation(); // Sử dụng useNavigation để điều hướng

  const handleLogin = async () => {
    // Kiểm tra các trường không được để trống
    if (!identifier || !password) {
      setMessage('Số điện thoại/email và mật khẩu không được để trống.');
      return;
    }

    setLoading(true); // Bắt đầu trạng thái loading
    try {
      //const url = `${url}/API/dangnhap.php`; // URL đến API PHP
      const response = await fetch(`${url}/API/dangnhap.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({identifier, password}), // Gửi số điện thoại/email và mật khẩu
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập không thành công!');
      }

      const data = await response.json();

      if (data.user_id) {
        setMessage('Đăng nhập thành công!');
        // Lưu user_id vào AsyncStorage
        await AsyncStorage.setItem('userId', data.user_id.toString());

        setTimeout(() => {
          navigation.navigate('HomeScreen'); // Chuyển sang màn hình HomeScreen sau khi đăng nhập thành công
        }, 1000);
      } else {
        setMessage('Thông tin không đúng!');
      }
    } catch (error) {
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại hoặc email"
        value={identifier}
        onChangeText={setIdentifier}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input2}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    color: '#000',
    marginBottom: 15,
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginTop: -140,
    marginLeft: -250,
  },
  input: {
    height: 60,
    width: '80%',
    borderColor: '#15c2ad',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 100,
    color: '#333', // Màu chữ trong TextInput
  },
  input2: {
    height: 60,
    width: '80%',
    borderColor: '#15c2ad',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    color: '#333', // Màu chữ trong TextInput
  },
  button: {
    height: 60,
    width: '80%',
    backgroundColor: '#15c2ad',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default Login;
