import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Thêm trường xác nhận mật khẩu
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleRegister = async () => {
    // Kiểm tra các trường yêu cầu không rỗng
    if (!username || !password || !email || !soDienThoai) {
      setMessage('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    // Kiểm tra mật khẩu phải có ít nhất 8 ký tự
    if (password.length < 8) {
      setMessage('Mật khẩu phải dài ít nhất 8 ký tự.');
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      setMessage('Mật khẩu và mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const url = 'http://192.168.129.39/API/dangky.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email,
          so_dien_thoai: soDienThoai,
        }),
      });

      const data = await response.json();
      if (data.message === 'thanh cong') {
        setMessage('Đăng ký thành công!');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1000);
      } else {
        setMessage(data.message || 'Đăng ký thất bại.');
      }
    } catch (error) {
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input1}
        placeholder="Số điện thoại"
        placeholderTextColor="#888"
        value={soDienThoai}
        onChangeText={setSoDienThoai}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#888"
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholderTextColor="#888"
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholderTextColor="#888"
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
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
    padding: 16,
    backgroundColor: '#f9f9f9', // Slight background overlay
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    color: '#000',
    marginBottom: 15,
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginTop: -10,
    marginLeft: -220,
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
    color: '#333', // Chỉnh màu chữ cho dễ đọc
    fontSize: 16, // Cân chỉnh kích thước chữ để dễ đọc
  },
  input1: {
    height: 60,
    width: '80%',
    borderColor: '#15c2ad',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 80,
    color: '#333', // Chỉnh màu chữ cho dễ đọc
    fontSize: 16, // Cân chỉnh kích thước chữ để dễ đọc
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

export default Register;
