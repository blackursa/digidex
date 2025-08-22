import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangePickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.label}>From:</Text>
        <TouchableOpacity
          onPress={() => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + 1);
            if (date <= endDate) {
              onStartDateChange(date);
            }
          }}
          testID="start-date-picker"
        >
          <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.label}>To:</Text>
        <TouchableOpacity
          onPress={() => {
            const date = new Date(endDate);
            date.setDate(date.getDate() - 1);
            if (date >= startDate && date <= new Date()) {
              onEndDateChange(date);
            }
          }}
          testID="end-date-picker"
        >
          <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
