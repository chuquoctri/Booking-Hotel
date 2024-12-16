import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import backIcon from '../assets/back.png'; // Đường dẫn tới hình ảnh nút Back
import url from '../../ipconfig';

const ProfileScreen = ({navigation}) => {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState(''); // Mật khẩu cũ
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Thêm các state cho danh sách thanh toán
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
        if (id) {
          // Lấy thông tin người dùng
          const response = await fetch(
            `${url}/API/get_user_info.php?id_nguoi_dung=${id}`,
          );
          const data = await response.json();

          if (data.message) {
            Alert.alert('Thông báo', data.message);
          } else {
            setName(data.ten_dang_nhap);
            setEmail(data.email);
            setPhone(data.so_dien_thoai);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPayments = async () => {
      try {
        if (userId) {
          const response = await fetch(
            `${url}/API/get_thanhtoan.php?id_nguoi_dung=${userId}`,
          );
          const data = await response.json();
          if (data.status === 'success') {
            setPayments(data.data); // Lưu thông tin thanh toán
          } else {
            Alert.alert('Thông báo', 'Không tìm thấy thông tin thanh toán.');
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin thanh toán:', error);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchUserInfo();
    fetchPayments();
  }, [userId]); // Chạy lại khi `userId` thay đổi

  const handleUpdate = async () => {
    if (!name || !email || !phone) {
      Alert.alert(
        'Thông báo',
        'Tên, email và số điện thoại không được để trống.',
      );
      return;
    }

    // Nếu người dùng nhập mật khẩu mới, cần phải nhập mật khẩu cũ
    if (newPassword && !oldPassword) {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập mật khẩu cũ để thay đổi mật khẩu.',
      );
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${url}/API/update_user_info.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_nguoi_dung: userId,
          old_password: oldPassword, // Gửi mật khẩu cũ nếu có
          name: name,
          email: email,
          phone: phone,
          new_password: newPassword, // Gửi mật khẩu mới nếu có
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Thông báo', data.message);
      } else {
        Alert.alert('Thông báo', data.message);
      }
    } catch (error) {
      Alert.alert('Thông báo', 'Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Xoá thông tin người dùng khỏi AsyncStorage
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('name');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('phone');
      await AsyncStorage.removeItem('newPassword');
      await AsyncStorage.removeItem('oldPassword');

      // Đặt lại các giá trị state về mặc định
      setUserId(null);
      setName('');
      setEmail('');
      setPhone('');
      setOldPassword('');
      setNewPassword('');

      // Điều hướng về trang đăng nhập
      navigation.replace('Login_Register'); // Điều hướng tới trang đăng nhập
    } catch (error) {
      Alert.alert('Thông báo', 'Có lỗi xảy ra khi đăng xuất.');
    }
  };

  if (loading || loadingPayments) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Image source={backIcon} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Trang cá nhân</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu cũ"
        placeholderTextColor="#000000"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        placeholderTextColor="#000000"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
        disabled={updating}>
        {updating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cập nhật thông tin và mật khẩu</Text>
        )}
      </TouchableOpacity>

      {/* Nút đăng xuất */}
      <TouchableOpacity
        style={[styles.button, {backgroundColor: '#ff5c5c', marginTop: 20}]}
        onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* Hiển thị danh sách thanh toán */}
      <ScrollView style={styles.paymentsContainer}>
        <Text style={styles.subTitle}>Lịch sử thanh toán</Text>
        {payments.length === 0 ? (
          <Text style={styles.noPayments}>Không có hóa đơn thanh toán nào</Text>
        ) : (
          payments.map(payment => (
            <View key={payment.id_thanh_toan} style={styles.paymentItem}>
              <Text style={styles.paymentText}>
                ID Thanh toán: {payment.id_thanh_toan}
              </Text>
              <Text style={styles.paymentText}>
                Phương thức thanh toán: {payment.phuong_thuc_thanh_toan}
              </Text>
              <Text style={styles.paymentText}>
                Trạng thái: {payment.trang_thai_thanh_toan}
              </Text>
              <Text style={styles.paymentText}>
                Số tiền: {payment.so_tien} VND
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000', // Màu chữ đen
  },
  input: {
    height: 50,
    borderColor: '#15c2ad',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    color: '#000', // Màu chữ đen
  },
  button: {
    height: 50,
    backgroundColor: '#15c2ad',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentsContainer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    flex: 1,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000', // Màu chữ đen
  },
  paymentItem: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  paymentText: {
    color: '#000', // Màu chữ đen
  },
  noPayments: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#000', // Màu chữ đen
  },
});

export default ProfileScreen;
