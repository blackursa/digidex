import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';

interface PaginatedListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  onEndReached: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  pageSize?: number;
}

export function PaginatedList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  isLoading = false,
  hasMore = true,
  pageSize = 20,
}: PaginatedListProps<T>) {
  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#999999" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => renderItem(item)}
      keyExtractor={keyExtractor}
      onEndReached={hasMore ? onEndReached : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      initialNumToRender={pageSize}
      maxToRenderPerBatch={pageSize}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999999',
  },
});
