import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';

const VNPayWebView = ({route, navigation}) => {
  const {vnpUrl} = route.params; // URL VNPay được truyền từ PaymentScreen

  // Xử lý sự kiện khi thanh toán hoàn tất
  const handleNavigationStateChange = navState => {
    const {url} = navState;

    // Kiểm tra URL trả về sau khi thanh toán
    if (url.includes('http://your_return_url.com')) {
      navigation.navigate('PaymentSuccess', {success: true}); // Điều hướng tới trang thành công
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{uri: vnpUrl}}
        style={{flex: 1}}
        onNavigationStateChange={handleNavigationStateChange} // Theo dõi URL trả về
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -25}, {translateY: -25}],
  },
});

export default VNPayWebView;
