import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import url from '../../ipconfig';
import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import backIcon from '../assets/back.png'; // Đường dẫn tới hình ảnh nút Back
import deleteIcon from '../assets/delete.png'; // Đường dẫn đến hình ảnh nút xóa

const BookingListScreen = ({navigation}) => {
  const [bookings, setBookings] = useState([]);
  const [totalCost, setTotalCost] = useState(0); // Biến lưu tổng tiền

  // Hàm lấy danh sách phòng đã đặt bằng fetch
  const fetchBookings = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      if (id !== null) {
        const response = await fetch(`${url}/API/get_datphong.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_nguoi_dung: id,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Dữ liệu trả về từ API:', data); // Log dữ liệu API

        setBookings(data.bookings || []);
        setTotalCost(data.totalCost || 0); // Lấy tổng tiền từ API
      } else {
        console.log('No User ID found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách phòng đã đặt.');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Hàm định dạng số thành chuỗi với dấu phẩy phân chia hàng ngàn
  const formatCurrency = value => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Hàm xóa đặt phòng
  const deleteBooking = async id_dat_phong => {
    try {
      console.log('Đang gửi yêu cầu xóa với id_dat_phong:', id_dat_phong);
      const response = await fetch(`${url}/API/delete_datphong.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id_dat_phong: id_dat_phong}), // Gửi dữ liệu dưới dạng JSON
      });

      const result = await response.json();
      console.log(result); // Log kết quả trả về từ server

      if (result.status === 'success') {
        Alert.alert('Thành công', 'Đặt phòng đã được xóa.');

        // Cập nhật lại danh sách đặt phòng sau khi xóa
        const updatedBookings = bookings.filter(
          item => item.id_dat_phong !== id_dat_phong,
        );
        setBookings(updatedBookings);

        // Tính lại tổng tiền
        const newTotalCost = updatedBookings.reduce(
          (acc, item) =>
            acc +
            parseFloat(item.tong_tien_phong || 0) +
            parseFloat(item.tong_tien_dich_vu || 0),
          0,
        );
        setTotalCost(newTotalCost);
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể xóa đặt phòng.');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      Alert.alert('Lỗi', 'Không thể kết nối tới máy chủ.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Image source={backIcon} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.header}>Danh Sách Phòng Đã Thêm</Text>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id_dat_phong.toString()}
        renderItem={({item}) => (
          <View style={styles.bookingItem}>
            <Image
              source={{uri: item.hinhanh}}
              style={styles.roomImage}
              resizeMode="cover"
            />
            <View style={styles.roomInfo}>
              <Text style={styles.title}>Phòng: {item.loai_phong}</Text>
              <Text style={styles.text}>Ngày nhận: {item.ngay_nhan_phong}</Text>
              <Text style={styles.text}>Ngày trả: {item.ngay_tra_phong}</Text>
              <Text style={styles.text}>
                Tổng tiền phòng: {formatCurrency(item.tong_tien_phong || 0)} VNĐ
              </Text>
              <Text style={styles.text}>
                Tổng tiền dịch vụ: {formatCurrency(item.tong_tien_dich_vu || 0)}{' '}
                VNĐ
              </Text>
              <Text style={styles.text}>
                Tổng cộng: {formatCurrency(item.tong_tien || 0)} VNĐ
              </Text>

              {/* Nút xóa */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Xóa Đặt Phòng',
                    'Bạn có chắc chắn muốn xóa đặt phòng này?',
                    [
                      {text: 'Hủy', style: 'cancel'},
                      {
                        text: 'Xóa',
                        onPress: () => deleteBooking(item.id_dat_phong),
                      },
                    ],
                  );
                }}>
                <Image
                  source={deleteIcon} // Sử dụng hình ảnh xóa
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Hiển thị tổng tiền */}
      <Text style={styles.totalCost}>
        Tổng tiền tất cả phòng: {formatCurrency(totalCost)} VNĐ
      </Text>

      <Button
        title="Thanh Toán Tất Cả"
        onPress={() =>
          navigation.navigate('PaymentScreen', {bookings, totalCost})
        }
        color="#15c2ad"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    marginTop: 40,
  },
  bookingItem: {
    flexDirection: 'row', // Đặt các mục theo chiều ngang
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3,
  },
  roomImage: {
    width: 100, // Chiều rộng ảnh
    height: 100, // Chiều cao ảnh
    borderRadius: 10,
    marginRight: 15, // Khoảng cách giữa ảnh và thông tin phòng
    marginTop: '10%',
  },
  roomInfo: {
    flex: 1, // Chiếm toàn bộ không gian còn lại
    justifyContent: 'center', // Căn giữa các thông tin phòng
  },
  title: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    color: 'black',
    fontSize: 16,
    marginTop: 5,
  },
  totalCost: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#f8d7e4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteIcon: {
    marginLeft: 70,
    width: 30, // Kích thước của vùng chứa icon
    height: 30, // Kích thước của vùng chứa icon
    borderRadius: 20, // Làm tròn góc để tạo hiệu ứng nút tròn
  },
});

export default BookingListScreen;
