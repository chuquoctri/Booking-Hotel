import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import url from '../../ipconfig';

const fetchFavoriteHotels = async userId => {
  try {
    const response = await fetch(`${url}/API/get_yeuthich.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_favorites',
        id_nguoi_dung: userId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return data.favorites;
    } else {
      Alert.alert('Lỗi', data.message);
      return [];
    }
  } catch (error) {
    console.error('Lỗi khi gọi API: ', error);
    Alert.alert('Lỗi', 'Không thể kết nối tới máy chủ.');
    return [];
  }
};

const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId !== null) {
          setUserId(parseInt(storedUserId, 10));
        }
      } catch (error) {
        console.error('Lỗi khi lấy userId từ AsyncStorage: ', error);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      const getFavoriteHotels = async () => {
        setLoading(true);
        const hotels = await fetchFavoriteHotels(userId);
        setFavoriteHotels(hotels);
        setLoading(false);
      };

      getFavoriteHotels();
    }
  }, [userId]);

  const renderFavoriteHotelItem = ({item}) => (
    <View style={styles.hotelContainer}>
      <Image source={{uri: item.hinhanh}} style={styles.hotelImage} />
      <Text style={styles.hotelName}>{item.ten_khach_san}</Text>
      <Text style={styles.city}>{item.thanh_pho}</Text>
      <Text style={styles.stars}>{item.so_sao} ⭐</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

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
      <Text style={styles.title}>Danh mục yêu thích</Text>
      {favoriteHotels.length === 0 ? (
        <Text style={styles.noFavoritesText}>
          Không có khách sạn yêu thích nào!
        </Text>
      ) : (
        <FlatList
          data={favoriteHotels}
          renderItem={renderFavoriteHotelItem}
          keyExtractor={item => item.id_khach_san.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotelContainer: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  hotelImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  city: {
    fontSize: 16,
    color: '#777',
    marginTop: 4,
  },
  stars: {
    fontSize: 16,
    color: '#f39c12',
  },
  noFavoritesText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    marginTop: 20,
  },
  backButton: {
    marginBottom: 10,
    padding: 10,
    marginTop:-20,
    marginLeft:-20,
  },
  backButtonText: {
    height: 35,
    width: 35,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
    marginTop:-25,
  },
});

export default FavoriteScreen;
