import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps, Pressable, StyleSheet } from 'react-native';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  error?: string;
}

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <RNTextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          {...props}
        />
        <Pressable 
          onPress={() => setShowPassword(!showPassword)} 
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>{showPassword ? '👁' : '🔒'}</Text>
        </Pressable>
      </View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 17,
    paddingVertical: 0,
    // @ts-ignore - Web-only properties to remove focus outline
    outline: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  iconButton: {
    marginLeft: 12,
    padding: 4,
  },
  iconText: {
    fontSize: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 8,
  },
});
