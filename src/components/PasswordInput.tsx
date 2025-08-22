import type { FC } from 'react';
import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  hasError?: boolean;
}

export const PasswordInput: FC<PasswordInputProps> = ({ 
  style,
  hasError,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        style={[
          styles.input,
          hasError && styles.inputError,
          style,
        ]}
        secureTextEntry={!isVisible}
      />
      <TouchableOpacity
        style={styles.visibilityButton}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Ionicons
          name={isVisible ? 'eye-off' : 'eye'}
          size={24}
          color="#666"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  visibilityButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
});
