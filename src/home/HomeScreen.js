import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker'; // Import Picker
import url from '../../ipconfig';
import bgr from '../assets/doan4.png'; // Đường dẫn đến hình ảnh nền
import deleteIcon from '../assets/search.png'; // Đường dẫn đến ảnh "deleteIcon"
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const HomeScreen = () => {
  const navigation = useNavigation();
  const [hotels, setHotels] = useState([]);
  const [favoriteHotels, setFavoriteHotels] = useState({});
  const [keyword, setKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState(''); // New state for city selection
  const [cities, setCities] = useState([]); // State to store cities
  const [userId, setUserId] = useState(null); // State to store userId

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Lấy userId từ AsyncStorage hoặc từ nguồn khác
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.error('User ID not found');
        }
      } catch (error) {
        console.error('Error retrieving user ID: ', error);
      }
    };

    const fetchHotels = async () => {
      try {
        const response = await fetch(`${url}/API/get_khachsan.php`);
        const data = await response.json();
        setHotels(data); // Giả định dữ liệu trả về là một mảng khách sạn
      } catch (error) {
        console.error('Error fetching hotel data: ', error);
      }
    };

    const fetchFavoriteHotels = async () => {
      if (userId) {
        try {
          const response = await fetch(`${url}/API/get_yeuthich.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({id_nguoi_dung: userId}),
          });
          const data = await response.json();
          if (data.success) {
            const favoriteIds = data.favorites.reduce((acc, curr) => {
              acc[curr.id_khach_san] = true;
              return acc;
            }, {});
            setFavoriteHotels(favoriteIds);
          }
        } catch (error) {
          console.error('Error fetching favorite data: ', error);
        }
      }
    };

    const fetchCities = async () => {
      try {
        const response = await fetch(`${url}/API/get_khachsan.php`); // You can use a specific endpoint to fetch cities
        const data = await response.json();
        const cityList = data.map(hotel => hotel.thanh_pho); // Assuming each hotel has a "thanh_pho" field
        const uniqueCities = [...new Set(cityList)]; // Remove duplicates
        setCities(uniqueCities); // Set the list of cities
      } catch (error) {
        console.error('Error fetching cities: ', error);
      }
    };

    fetchUserId(); // Fetch the user ID when the component mounts
    fetchHotels();
    fetchCities(); // Fetch the cities list when the component mounts
  }, [userId]);

  const handleSearch = () => {
    console.log('Keyword:', keyword);
    console.log('Selected City:', selectedCity);

    // Nếu có từ khóa hoặc thành phố, điều hướng đến trang kết quả tìm kiếm
    if (keyword.trim() || selectedCity) {
      navigation.navigate('RoomSearchResults', {keyword, selectedCity});
    } else {
      Alert.alert('Error', 'Please enter a keyword or select a city to search');
    }
  };

  const toggleFavorite = async id => {
    const action = favoriteHotels[id] ? 'remove' : 'add';

    try {
      const postData = {
        action,
        id_nguoi_dung: userId,
        id_khach_san: id,
      };

      // Log dữ liệu gửi đi
      console.log('Data sent to server:', postData);

      const response = await fetch(`http://192.168.129.39/API/yeuthich.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Log dữ liệu trả về từ server
      console.log('Response from server:', data);

      if (data.success) {
        setFavoriteHotels(prevState => ({
          ...prevState,
          [id]: action === 'add',
        }));
      } else {
        console.error('Không thể thêm vào yêu thích:', data.message);
      }
    } catch (error) {
      console.error('Lỗi khi kết nối API:', error);
    }
  };

  const renderHotelItem = ({item}) => (
    <TouchableOpacity
      style={styles.hotelContainer}
      onPress={() =>
        navigation.navigate('HotelDetail', {id: item.id_khach_san})
      }>
      <Image source={{uri: item.hinhanh}} style={styles.hotelImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.hotelName}>{item.ten_khach_san}</Text>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item.id_khach_san)}>
          <Image
            source={
              favoriteHotels[item.id_khach_san]
                ? require('../assets/heart_filled.png')
                : require('../assets/heart_empty.png')
            }
            style={styles.iconHeart}
          />
        </TouchableOpacity>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Image
              source={require('../assets/locationnn.png')}
              style={styles.iconLocation}
            />
            <Text style={styles.city}>{item.thanh_pho}</Text>
          </View>
          <View style={styles.starsContainer}>
            <Image
              source={require('../assets/star.png')}
              style={styles.iconStar}
            />
            <Text style={styles.stars}>{item.so_sao}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Image source={bgr} style={styles.bgr} />
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.introText}>
          Discover and book the best hotels for your amazing journey.
        </Text>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={[styles.searchContainer, {backgroundColor: '#f2f2f2'}]}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Search for hotels..."
            placeholderTextColor="#000000"
            value={keyword}
            onChangeText={setKeyword}
          />

          {/* Add Picker for city selection */}
          <Picker
            selectedValue={selectedCity}
            onValueChange={setSelectedCity}
            style={[styles.picker, {color: '#000000'}]}
            tintColor="#000000">
            <Picker.Item label="City" value="" style={{color: '#000000'}} />
            {cities.map((city, index) => (
              <Picker.Item
                key={index}
                label={city}
                value={city}
                style={{color: '#000000'}}
              />
            ))}
          </Picker>

          {/* Image as the search button */}
          <TouchableOpacity onPress={handleSearch}>
            <Image source={deleteIcon} style={styles.searchButton} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={hotels}
        renderItem={renderHotelItem}
        keyExtractor={item => item.id_khach_san.toString()}
        contentContainerStyle={styles.listContainer}
      />
      {/* Thanh điều hướng dưới cùng */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.navigate('HomeScreen')}>
          <Image
            source={require('../assets/home.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() =>
            navigation.navigate('FavoriteScreen', {favoriteHotels})
          }>
          <Image
            source={require('../assets/heart_empty.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.navigate('VoucherScreen')}>
          <Image
            source={require('../assets/coupon.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() =>
            navigation.navigate('BookingListScreen', {bookingList: [], userId})
          }>
          <Image
            source={require('../assets/cart.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.navigate('ProfileScreen', {userId})}>
          <Image
            source={require('../assets/user.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  bgr: {
    marginLeft: '-5%',
    width: '110%',
    height: 180,
  },
  welcomeText: {
    position: 'absolute',
    top: 5,
    left: -2,
    fontSize: 35,
    fontWeight: 'bold',
    color: '#5F9EA0',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 4,
  },
  introText: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    width: '80%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#5F9EA0',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 4,
  },
  searchContainer: {
    height: 43,
    marginTop: 5,
    borderRadius: 20,
    marginBottom: 5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -16,
  },
  input: {
    width: 30,
    height: 40,
    borderColor: '#5F9EA0',
    borderWidth: 2,
    paddingHorizontal: 10,
    placeholderTextColor: '#000000',
    borderRadius: 20,
    flex: 1,
  },
  searchButton: {
    width: 25,
    height: 25,
    tintColor: '#5F9EA0',
  },
  picker: {
    height: 40,
    width: 140,
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 10,
  },
  listContainer: {
    paddingVertical: 10,
  },
  hotelContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    position: 'relative',
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
    marginBottom: 10,
  },
  favoriteIcon: {
    position: 'absolute',
    right: 15,
    top: -1,
    zIndex: 10,
  },
  iconHeart: {
    width: 24,
    height: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  city: {
    marginLeft: 5,
    fontSize: 16,
    color: 'gray',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  stars: {
    marginLeft: 5,
    fontSize: 16,
    color: 'gold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconLocation: {
    width: 18,
    height: 18,
  },
  iconStar: {
    width: 18,
    height: 18,
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  tabIcon: {
    width: 30,
    height: 30,
  },
});

export default HomeScreen;
