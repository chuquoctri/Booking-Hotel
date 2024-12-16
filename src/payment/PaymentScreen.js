import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import url from '../../ipconfig';

const PaymentScreen = ({route}) => {
  const {bookings} = route.params;
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('online'); // Mặc định là thanh toán trực tuyến
  const [voucherList, setVoucherList] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await fetch(
          `${url}/API/get_user_info.php?id_nguoi_dung=${userId}`,
        );
        const data = await response.json();
        if (data && data.id_nguoi_dung) {
          setUserInfo(data);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
        }
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy ID người dùng.');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng.');
    }
  };

  const fetchVoucherList = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await fetch(`${url}/API/get_use_voucher.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId: userId}),
        });
        const data = await response.json();
        if (data.vouchers) {
          setVoucherList(data.vouchers);
        } else {
          setVoucherList([]);
        }
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy ID người dùng.');
      }
    } catch (error) {
      console.error('Error fetching voucher list:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách voucher.');
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchVoucherList();
  }, []);

  const calculateTotalCost = () => {
    const total = bookings.reduce(
      (sum, booking) => sum + parseFloat(booking.tong_tien),
      0,
    );
    const discountAmount = (total * discount) / 100;
    return (total - discountAmount).toFixed(0);
  };

  const toggleVoucherUsage = item => {
    if (selectedVoucher && selectedVoucher.voucher_id === item.voucher_id) {
      setSelectedVoucher(null);
      setDiscount(0);
    } else {
      setSelectedVoucher(item);
      setDiscount(parseFloat(item.discount));
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const totalCost = calculateTotalCost();
      console.log('Total Cost:', totalCost);

      if (isNaN(totalCost) || totalCost == null) {
        throw new Error('Số tiền thanh toán không hợp lệ');
      }

      const formattedTotalCost = parseFloat(totalCost).toFixed(2);

      const userId = await AsyncStorage.getItem('userId');
      const paymentData = {
        id_dat_phong: bookings.map(booking => booking.id_dat_phong),
        phuong_thuc_thanh_toan: paymentMethod, // Giá trị từ Picker
        trang_thai_thanh_toan: 'cho_xu_ly', // Mặc định trạng thái
        so_tien: formattedTotalCost,
        id_nguoi_dung: userId,
        id_voucher: selectedVoucher ? selectedVoucher.voucher_id : null, // Voucher nếu có
        ngay_thanh_toan: new Date().toISOString(), // Thêm ngày thanh toán
      };

      console.log('Payment data being sent:', paymentData);

      const response = await fetch(`${url}/API/thanhtoan_api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (data.status === 'success') {
        Alert.alert('Thành công', 'Thanh toán thành công!');
        navigation.navigate('HomeScreen');
      } else {
        Alert.alert(
          'Thông báo',
          `Đã xảy ra lỗi: ${data.message || 'Không xác định được lỗi.'}`,
        );
        setLoading(false); // Dừng loading
      }
    } catch (error) {
      setLoading(false);
      console.error('Payment error:', error);
      Alert.alert(
        'Lỗi',
        `Đã xảy ra lỗi trong quá trình thanh toán: ${error.message}`,
      );
    }
  };

  const renderBookingItem = ({item}) => (
    <View style={styles.bookingItem}>
      <Text style={styles.text}>Phòng: {item.id_phong}</Text>
      <Text style={styles.text}>Ngày nhận: {item.ngay_nhan_phong}</Text>
      <Text style={styles.text}>Ngày trả: {item.ngay_tra_phong}</Text>
      <Text style={styles.text}>
        Tổng tiền: {parseFloat(item.tong_tien).toLocaleString('vi-VN')} VND
      </Text>
    </View>
  );

  const renderVoucherItem = ({item}) => (
    <View style={styles.voucherItem}>
      <Text style={styles.text_voucher}>
        {item.voucher_name} - Giảm: {item.discount}%
      </Text>
      <TouchableOpacity
        style={styles.useButton}
        onPress={() => toggleVoucherUsage(item)}>
        <Text style={styles.buttonText}>
          {selectedVoucher && selectedVoucher.voucher_id === item.voucher_id
            ? 'Hủy'
            : 'Dùng'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin thanh toán</Text>

      <View style={styles.userInfo}>
        <Text style={styles.text}>
          Tên: {userInfo.ten_dang_nhap || 'Chưa có thông tin'}
        </Text>
        <Text style={styles.text}>
          Email: {userInfo.email || 'Chưa có thông tin'}
        </Text>
        <Text style={styles.text}>
          Số điện thoại: {userInfo.so_dien_thoai || 'Chưa có thông tin'}
        </Text>
      </View>

      <Text style={styles.label}>Chọn phương thức thanh toán:</Text>
      <Picker
        style={styles.text}
        selectedValue={paymentMethod}
        onValueChange={value => setPaymentMethod(value)}>
        <Picker.Item label="Thanh toán trực tuyến" value="online" />
        <Picker.Item label="Thanh toán trực tiếp" value="tien_mat" />
      </Picker>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id_dat_phong}
      />

      <Text style={styles.label}>Chọn voucher:</Text>
      <FlatList
        data={voucherList}
        renderItem={renderVoucherItem}
        keyExtractor={item => item.voucher_id}
      />

      <Text style={styles.totalCost}>
        Tổng chi phí: {parseFloat(calculateTotalCost()).toLocaleString('vi-VN')}{' '}
        VND
      </Text>

      <Button title="Thanh toán" onPress={handlePayment} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#2c3e50',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
  label: {
    color: '#8e44ad',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  text: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text_voucher: {
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 10,
    fontSize: 14,
    lineHeight: 18,
    color: 'black',
  },
  bookingItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 10,
  },
  voucherItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  useButton: {
    padding: 5,
    backgroundColor: '#3498db',
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  totalCost: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: 'red',
  },
});

export default PaymentScreen;
