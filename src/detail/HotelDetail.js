import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import url from '../../ipconfig';

const HotelDetailScreen = ({route, navigation}) => {
  const {id} = route.params;
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [people, setPeople] = useState(1);
  const [priceRange, setPriceRange] = useState(1000000);

  useEffect(() => {
    // Gọi API để lấy thông tin khách sạn
    fetch(`${url}/API/get_khachsan.php?id=${id}`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          setHotel(data[0]);
        }
      })
      .catch(error => {
        console.error('Error fetching hotel details: ', error);
      });

    // Gọi API để lấy danh sách phòng của khách sạn
    fetch(
      `${url}/API/get_phong.php?hotel_id=${id}&check_in=${
        checkInDate.toISOString().split('T')[0]
      }&check_out=${
        checkOutDate.toISOString().split('T')[0]
      }&people=${people}&price=${priceRange}`,
    )
      .then(response => response.json())
      .then(data => {
        setRooms(data);
      })
      .catch(error => {
        console.error('Error fetching rooms: ', error);
      });
  }, [id, checkInDate, checkOutDate, people, priceRange]);

  if (!hotel) {
    return <Text>Loading...</Text>;
  }

  const openMap = () => {
    const lat = hotel.vi_do;
    const lng = hotel.kinh_do;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const onSearchRooms = () => {
    console.log(`Check-in: ${checkInDate}`);
    console.log(`Check-out: ${checkOutDate}`);
    console.log(`Số người: ${people}`);
    console.log(`Giá tiền: ${priceRange}`);

    // Gọi lại API để lấy danh sách phòng khi tìm kiếm
    fetch(
      `${url}/API/get_phong.php?hotel_id=${id}&check_in=${
        checkInDate.toISOString().split('T')[0]
      }&check_out=${
        checkOutDate.toISOString().split('T')[0]
      }&people=${people}&price=${priceRange}`,
    )
      .then(response => response.json())
      .then(data => {
        setRooms(data);
      })
      .catch(error => {
        console.error('Error fetching rooms: ', error);
      });
  };

  const onRoomSelect = room => {
    navigation.navigate('BookingScreen', {
      room,

      people,
      id_phong: id,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Image source={{uri: hotel.hinhanh}} style={styles.hotelImage} />
        <Text style={styles.hotelName}>{hotel.ten_khach_san}</Text>
        <Text style={styles.stars}>⭐ {hotel.so_sao}</Text>
        <TouchableOpacity style={styles.locationContainer} onPress={openMap}>
          <Image
            source={require('../assets/locationnn.png')}
            style={styles.iconLocation}
          />
          <Text style={styles.address}>{hotel.dia_chi}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.datePickerRow}>
        <View style={styles.datePickerColumn}>
          <Text style={styles.textMoney}>Ngày nhận phòng:</Text>
          <TouchableOpacity onPress={() => setShowCheckInPicker(true)}>
            <Text style={styles.dateText}>
              {checkInDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowCheckInPicker(false);
                if (selectedDate) {
                  setCheckInDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.datePickerColumn}>
          <Text style={styles.textMoney}>Ngày trả phòng:</Text>
          <TouchableOpacity onPress={() => setShowCheckOutPicker(true)}>
            <Text style={styles.dateText}>
              {checkOutDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowCheckOutPicker(false);
                if (selectedDate) {
                  setCheckOutDate(selectedDate);
                }
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.peoplePriceContainer}>
        <View style={styles.peopleContainer}>
          <Image source={require('../assets/group.png')} style={styles.icon} />
          <Text style={styles.counterValue}>{people}</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity onPress={() => setPeople(people + 1)}>
              <Image
                source={require('../assets/outline.png')}
                style={styles.tabIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPeople(people > 1 ? people - 1 : 1)}>
              <Image
                source={require('../assets/down.png')}
                style={styles.tabIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.moneyRow}>
            <Image
              source={require('../assets/money.png')}
              style={styles.icon}
            />
            <Text style={styles.textMoney}>
              {priceRange.toLocaleString('vi-VN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              VND
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={200000}
            maximumValue={5000000}
            step={50000}
            value={priceRange}
            onValueChange={value => setPriceRange(value)}
            minimumTrackTintColor="#1fb28a"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#b9e4c9"
          />
        </View>
      </View>

      {/* <TouchableOpacity style={styles.searchButton} onPress={onSearchRooms}>
        <Image
          source={require('../assets/search.png')}
          style={styles.tabIcon}
        />
      </TouchableOpacity> */}

      {/* Hiển thị danh sách phòng */}
      <FlatList
        data={rooms}
        keyExtractor={item => item.id_phong.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => onRoomSelect(item)}>
            {/* Hình ảnh phòng bên trái */}
            <Image source={{uri: item.hinhanh}} style={styles.roomImage} />
            {/* Thông tin phòng bên phải */}
            <View style={styles.roomInfoContainer}>
              <Text style={styles.roomName}>{item.loai_phong}</Text>
              <Text style={styles.roomPrice}>
                {Math.floor(item.gia_mot_dem).toLocaleString()} VND
              </Text>
              <Text style={styles.roomCapacity}>
                Sức chứa: {item.suc_chua} người
              </Text>
              <Text style={styles.roomAvailability}>
                {item.con_trong ? 'Còn trống' : 'Hết phòng'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.roomListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  hotelImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  hotelName: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  infoContainer: {
    marginBottom: 20,
  },
  stars: {
    fontSize: 18,
    color: 'gold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  iconLocation: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  address: {
    fontSize: 16,
    color: 'blue',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  datePickerColumn: {
    flex: 1,
    marginRight: 10,
  },
  textMoney: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 18,
    color: 'black',
  },
  peoplePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  counterValue: {
    color: 'black',
    fontSize: 20,
    marginHorizontal: 10,
  },
  counterControls: {
    flexDirection: 'row',
  },
  tabIcon: {
    width: 25,
    height: 25,
    marginHorizontal: 5,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 20,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  searchButton: {
    backgroundColor: '#1fb28a',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  roomListContainer: {
    paddingBottom: 20,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  roomImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  roomInfoContainer: {
    marginLeft: 10,
    flex: 1,
  },
  roomName: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomPrice: {
    fontSize: 16,
    color: 'green',
  },
  roomCapacity: {
    color: 'black',
    fontSize: 14,
  },
  roomAvailability: {
    fontSize: 14,
    color: 'red',
  },
});

export default HotelDetailScreen;
