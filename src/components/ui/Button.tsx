import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'rounded-xl p-4 items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'bg-secondary-500 active:bg-secondary-600',
    outline: 'border-2 border-primary-500 active:bg-primary-50',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-500',
  };

  const disabledStyles = disabled || loading ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0ea5e9' : '#fff'} />
      ) : (
        <Text className={`${textStyles[variant]} font-semibold text-lg`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
