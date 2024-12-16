import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import DatePicker from 'react-native-date-picker'; // Import DatePicker
import url from '../../ipconfig';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const BookingScreen = ({route, navigation}) => {
  const {room, id_phong} = route.params;
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [userId, setUserId] = useState(null); // Trạng thái để lưu user_id

  useEffect(() => {
    // Lấy userId từ AsyncStorage khi màn hình được load
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id); // Lưu user_id vào state
    };

    fetchUserId(); // Gọi hàm lấy user_id từ AsyncStorage

    // Lấy dịch vụ cho khách sạn
    fetch(
      `${url}/API/dichvu.php?action=getDichVuByKhachSanId&id_khach_san=${id_phong}`, // URL đến API PHP
    )
      .then(response => response.json()) // Phân tập dữ liệu JSON
      .then(data => {
        setServices(data); // Lưu dịch vụ vào state
      })
      .catch(error => {
        console.error('Lỗi khi lấy dịch vụ: ', error);
      });
  }, [id_phong]);

  // Hàm chọn/bỏ chọn dịch vụ
  const toggleService = service => {
    if (selectedServices.includes(service)) {
      // Nếu dịch vụ đã được chọn, loại bỏ nó khỏi danh sách
      setSelectedServices(
        selectedServices.filter(item => item.id_dich_vu !== service.id_dich_vu),
      );
    } else {
      // Nếu chưa chọn, thêm dịch vụ vào danh sách
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Hàm tính tổng tiền bao gồm giá phòng và dịch vụ
  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      const servicePrice = Number(service.gia_dich_vu);
      return total + servicePrice;
    }, 0);
  };

  const onConfirmBooking = () => {
    if (!userId) {
      alert('Bạn cần đăng nhập để đặt phòng!');
      return;
    }

    // Đảm bảo giá phòng là số
    const roomPrice = Number(room.gia_mot_dem); // Chuyển giá phòng thành số nếu nó là chuỗi

    // Tính tổng tiền bao gồm giá phòng và dịch vụ (nếu có)
    const totalPrice = roomPrice + calculateTotalPrice(); // Thêm giá phòng vào tổng tiền

    // Xây dựng thông tin đặt phòng
    const bookingDetails = {
      id_nguoi_dung: userId, // Sử dụng user_id từ AsyncStorage
      id_phong: room.id_phong, // ID phòng
      ngay_nhan_phong: checkIn.toISOString().split('T')[0], // Định dạng ngày nhận phòng
      ngay_tra_phong: checkOut.toISOString().split('T')[0], // Định dạng ngày trả phòng
      tong_tien: totalPrice.toFixed(2), // Đảm bảo tổng tiền có 2 chữ số thập phân
      selected_services:
        selectedServices.length > 0
          ? selectedServices.map(service => ({
              id_dich_vu: service.id_dich_vu, // ID dịch vụ
            }))
          : [], // Nếu không có dịch vụ, gửi mảng rỗng
    };

    console.log(bookingDetails);

    fetch(`${url}/API/datphong.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDetails),
    })
      .then(response => response.json())
      .then(data => {
        if (data.booking_id) {
          alert('Thêm thành công. Hãy quay lại trang thanh toán!');
          navigation.navigate('HotelDetail', {id: id_phong});
        } else {
          alert('Ngày này không còn trống. Hãy chọn ngày khác!');
        }
      })
      .catch(error => {
        console.error('Lỗi khi đặt phòng: ', error);
      });
  };

  // Dữ liệu để hiển thị cho FlatList
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.serviceItem,
        selectedServices.includes(item) && styles.selectedServiceItem,
      ]}
      onPress={() => toggleService(item)}>
      <Text style={styles.serviceName}>{item.ten_dich_vu}</Text>
      <Text style={styles.servicePrice}>
        {Math.floor(Number(item.gia_dich_vu)).toLocaleString()} VND
      </Text>
      <Text style={styles.serviceDescription}>{item.mo_ta}</Text>
    </TouchableOpacity>
  );

  // Dữ liệu để hiển thị cho các phần khác trong FlatList
  const renderBookingDetails = () => (
    <View>
      <Text style={styles.title}>Chi tiết phòng</Text>
      <Image source={{uri: room.hinhanh}} style={styles.roomImage} />
      <Text style={styles.roomName}>{room.loai_phong}</Text>
      <Text style={styles.roomPrice}>
        Giá 1 đêm: {Math.floor(room.gia_mot_dem).toLocaleString()} VND
      </Text>
      <Text style={styles.roomCapacity}>Sức chứa: {room.suc_chua} người</Text>

      <Text style={styles.title}>Chọn ngày nhận và trả phòng</Text>

      <View style={styles.dateContainer}>
        {/* Phần chọn ngày check-in */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerContainer}>Ngày nhận phòng:</Text>
          <DatePicker
            date={checkIn}
            onDateChange={setCheckIn}
            mode="date"
            style={{
              width: 180,
              backgroundColor: '#333333', // Đổi màu nền thành màu xám đậm
            }}
          />
        </View>

        {/* Phần chọn ngày check-out */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerContainer}>Ngày trả phòng:</Text>
          <DatePicker
            date={checkOut}
            onDateChange={setCheckOut}
            mode="date"
            style={{
              width: 180,
              backgroundColor: '#333333', // Đổi màu nền thành màu xám đậm
            }} // Set width explicitly to avoid errors
          />
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={[{key: 'bookingDetails'}, ...services]} // Chèn bookingDetails ở đầu
      keyExtractor={(item, index) =>
        item.key ? item.key : item.id_dich_vu.toString()
      }
      renderItem={({item}) =>
        item.key === 'bookingDetails'
          ? renderBookingDetails()
          : renderItem({item})
      }
      ListFooterComponent={
        <TouchableOpacity style={styles.bookButton} onPress={onConfirmBooking}>
          <Text style={styles.bookButtonText}>Xác nhận đặt phòng</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  roomImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  roomName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#1fb28a',
  },
  roomPrice: {
    fontSize: 20,
    color: '#28a745',
    marginTop: 5,
    fontWeight: '600',
  },
  roomCapacity: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  dateContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePickerContainer: {
    color: 'black',
    flex: 1,
    alignItems: 'center',
  },
  serviceItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedServiceItem: {
    backgroundColor: '#e0ffe0',
    borderColor: '#1fb28a',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 16,
    color: '#28a745',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    marginTop: 30,
    backgroundColor: '#1fb28a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default BookingScreen;
