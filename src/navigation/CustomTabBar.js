import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const CustomTabBar = props => {
  const {state, descriptors, navigation} = props;

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;

        const isFocused = state.index === index;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={({pressed}) => [
              styles.tabItem,
              isFocused && styles.tabItemFocused, // Highlight focused tab
              pressed && styles.tabItemPressed, // Highlight pressed state
            ]}>
            <Text
              style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  tabItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemFocused: {
    borderBottomWidth: 3,
    borderBottomColor: '#15c2ad', // Color of the bottom border for the focused tab
  },
  tabItemPressed: {
    backgroundColor: '#e0e0e0', // Background color when the tab is pressed
  },
  tabLabel: {
    fontSize: 16,
    color: '#333',
  },
  tabLabelFocused: {
    color: '#000', // Color of the text for the focused tab
  },
});

export default CustomTabBar;
