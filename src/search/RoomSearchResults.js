import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import url from '../../ipconfig'; // URL API của bạn

const RoomSearchResults = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {keyword, selectedCity} = route.params;
  const [hotels, setHotels] = useState([]);
  const [isSearching, setIsSearching] = useState(true);
  const [noResults, setNoResults] = useState(false); // Trạng thái khi không có kết quả

  useEffect(() => {
    const fetchHotels = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${url}/API/search_hotel.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword,
            city: selectedCity,
          }),
        });
        const data = await response.json();
        console.log('API Response:', data); // Kiểm tra toàn bộ dữ liệu API trả về

        if (data.success && data.data && data.data.length > 0) {
          // Nếu dữ liệu trả về có khách sạn
          setHotels(data.data);
          setNoResults(false); // Có khách sạn tìm thấy
        } else {
          // Nếu không có khách sạn nào
          setNoResults(true);
        }
      } catch (error) {
        console.error('Lỗi khi lấy kết quả tìm kiếm: ', error);
        Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi lấy dữ liệu');
      } finally {
        setIsSearching(false);
      }
    };

    fetchHotels();
  }, [keyword, selectedCity]);
  const renderHotelItem = ({item}) => (
    <TouchableOpacity
      style={styles.hotelContainer}
      onPress={() =>
        navigation.navigate('HotelDetail', {id: item.id_khach_san})
      }>
      <Image source={{uri: item.hinhanh}} style={styles.hotelImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.hotelName}>{item.ten_khach_san}</Text>
        <Text style={styles.hotelLocation}>{item.dia_chi}</Text>
        <Text style={styles.hotelCity}>{item.thanh_pho}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết quả tìm kiếm</Text>
      {isSearching ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : noResults ? (
        <Text style={styles.noResultsText}>
          Không tìm thấy khách sạn nào cho tìm kiếm của bạn.
        </Text>
      ) : (
        <FlatList
          data={hotels}
          renderItem={renderHotelItem}
          keyExtractor={item => item.id_khach_san.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  hotelContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  hotelImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoContainer: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  hotelLocation: {
    fontSize: 14,
    color: 'gray',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  hotelCity: {
    fontSize: 14,
    color: 'gray',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    marginTop: 20,
  },
});

export default RoomSearchResults;
