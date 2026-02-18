import React from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet, Touchable } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import DropdownSelect from '../button/DropdownSelect';

export default function List({
  items = [],
  selectedItem = null,
  onSelect = () => {},
  keyExtractor = (item) => item,
  renderItemContent = null, // optional custom renderer (item) => ReactNode
}) {

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [hoveredItem, setHoveredItem] = React.useState(null);
  
  const itemBackgroundColor = (item) => {
    if (item === selectedItem) {
      if (hoveredItem === item) {
        return theme.actionButtonHover; 
      } else {
        return theme.actionButton; 
      }
    } else if (item === hoveredItem) {
      return theme.listItemBackgroundHover;
    } else {
      return 'transparent';
    }
  };
  return (
    <FlatList
      style={[styles.list, {backgroundColor: theme.listItemBackground}]}
      data={items}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => {
        return (
          <TouchableOpacity
            style={[styles.listItem, { backgroundColor: itemBackgroundColor(item) }]}
            onPress={() => onSelect(item)}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {renderItemContent ? (
              renderItemContent(item)
            ) : (
              <Text style={styles.listItemText}>{String(item)}</Text>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: 320,
    maxHeight: '35vh',
    overflowY: 'auto',
    maxWidth: 320,
    flexShrink: 0,
    borderRadius: 8,
    direction: 'rtl',
    scrollbarGutter: 'stable',
    padding: 12,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    cursor: 'pointer',
    direction: 'ltr',
  },
  listItemText: {
    fontSize: 18,
    direction: 'ltr',
  },
});
