import { type FC } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  type TextInputProps,
} from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  error,
  ...inputProps
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          inputProps.multiline ? styles.multiline : null,
        ]}
        placeholderTextColor="#95a5a6"
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
});
