import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

const PaymentSuccess = ({route, navigation}) => {
  const {success} = route.params;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.message,
          {color: success ? 'green' : 'red'}, // Thay đổi màu dựa trên success
        ]}>
        {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
      </Text>
      <Button
        title="Quay về trang chủ"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Xóa phần color
  },
});

export default PaymentSuccess;
