import React from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export default function List({
  items = [],
  selectedItem = null,
  onSelect = () => {},
  keyExtractor = (item) => item,
  itemStyle = {},
  selectedItemStyle = {},
  listStyle = {},
  renderItemContent = null, // optional custom renderer (item) => ReactNode
}) {
  return (
    <FlatList
      style={[styles.list, listStyle]}
      data={items}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => {
        const isSelected = item === selectedItem;
        return (
          <TouchableOpacity
            style={[styles.listItem, itemStyle, isSelected ? selectedItemStyle : null]}
            onPress={() => onSelect(item)}
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
    maxHeight: '25vh',
    overflowY: 'auto',
    maxWidth: 320,
    flexShrink: 0,
    direction: 'rtl',
    scrollbarGutter: 'stable',
  },
  listItem: {
    paddingVertical: '1rem',
    paddingHorizontal: '1.5rem',
    cursor: 'pointer',
    direction: 'ltr',
  },
  listItemText: {
    fontSize: 18,
    direction: 'ltr',
  },
});
