import {AppRegistry} from 'react-native';
import App from './App'; // Đảm bảo đường dẫn chính xác đến tệp App
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
