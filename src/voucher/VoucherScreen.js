import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Nhập AsyncStorage
import {useNavigation} from '@react-navigation/native';
import url from '../../ipconfig';

const VoucherScreen = () => {
  const [vouchers, setVouchers] = useState([]);
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [userId, setUserId] = useState(null); // Lưu trữ ID người dùng
  const navigation = useNavigation(); // Sử dụng hook useNavigation để có quyền truy cập vào navigation

  useEffect(() => {
    // Lấy danh sách voucher từ API
    fetch(`${url}/API/get_vouchers.php`) // Thay thế bằng địa chỉ API thực tế
      .then(response => response.json())
      .then(data => {
        setVouchers(data);
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách voucher: ', error);
      });
  }, []);

  useEffect(() => {
    // Lấy ID người dùng từ AsyncStorage
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id); // Lưu ID người dùng
        }
      } catch (error) {
        console.error('Lỗi khi lấy ID người dùng: ', error);
      }
    };

    getUserId();
  }, []);

  const saveVoucher = voucherId => {
    fetch(`${url}/API/save_voucher.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId, // Sử dụng ID người dùng từ AsyncStorage
        voucherId: voucherId,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        setSavedVouchers([...savedVouchers, voucherId]);
      })
      .catch(error => {
        console.error('Lỗi khi lưu voucher: ', error);
      });
  };

  const useVoucher = voucherId => {
    // Xử lý khi người dùng nhấn vào "Dùng voucher"
    console.log('Dùng voucher ID: ', voucherId);
  };

  const renderVoucherItem = ({item}) => {
    const isSaved = savedVouchers.includes(item.id_giam_gia);
    return (
      <View style={styles.voucherContainer}>
        <View style={styles.voucherInfo}>
          <View style={styles.voucherDetails}>
            <Text style={styles.voucherName}>{item.ten_giam_gia}</Text>
            <Text style={styles.voucherCode}>Mã: {item.ma_giam_gia}</Text>
            <Text style={styles.voucherDiscount}>
              Giảm: {item.phan_tram_giam}%
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              isSaved
                ? useVoucher(item.id_giam_gia)
                : saveVoucher(item.id_giam_gia);
            }}>
            <Text style={styles.buttonText}>{isSaved ? 'Dùng' : 'Lưu'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/back.png')}
          style={styles.backButtonText}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Danh Sách Voucher</Text>
      <FlatList
        data={vouchers}
        keyExtractor={item => item.id_giam_gia.toString()}
        renderItem={renderVoucherItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    marginTop:-30,
  },
  voucherContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherDetails: {
    flex: 1,
  },
  voucherName: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  voucherCode: {
    color: '#333',
    fontSize: 14,
    marginBottom: 5,
  },
  voucherDiscount: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  backButton: {
    marginBottom: 10,
    padding: 10,
    marginTop: -20,
    marginLeft: -20,
  },
  backButtonText: {
    height: 35,
    width: 35,
  },
  button: {
    backgroundColor: '#15c2ad',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default VoucherScreen;
