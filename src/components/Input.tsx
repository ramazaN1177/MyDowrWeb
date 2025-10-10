// src/components/Input.tsx - Güncellenmiş versiyon
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholderColor?: 'gray' | 'light' | 'dark' | string;
  focusBackground: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  size = 'md',
  type = 'text',
  placeholderColor = 'gray',
  focusBackground = false,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-3.5 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Placeholder color variants
  const placeholderClasses = {
    gray: 'placeholder:text-gray-400',
    light: 'placeholder:text-gray-300',
    dark: 'placeholder:text-gray-600',
  };

  // Custom placeholder color için inline style
  const customPlaceholderStyle = !['gray', 'light', 'dark'].includes(placeholderColor)
    ? { '--placeholder-color': placeholderColor } as React.CSSProperties
    : {};

  const placeholderClass = ['gray', 'light', 'dark'].includes(placeholderColor)
    ? placeholderClasses[placeholderColor as keyof typeof placeholderClasses]
    : '';

  // Dynamic icon color based on focus state
  const iconColor = isFocused ? '#FFB300' : '#666';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div 
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconSizeClasses[size]}`}
            style={{ color: iconColor }}
          >
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          style={customPlaceholderStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full rounded-2xl border transition-all duration-200
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || isPassword ? 'pr-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
              : isFocused && focusBackground
                ? 'border-amber-500 bg-amber-50'
                : isFocused && !focusBackground
                  ? 'border-amber-500 bg-gray-50'
                  : 'border-gray-200 bg-gray-50'
            }
            ${placeholderClass}
            ${!placeholderClass ? '[&::placeholder]:text-[var(--placeholder-color)]' : ''}
            focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            font-medium
            ${className}
          `}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconSizeClasses[size]}`}
            style={{ color: iconColor }}
          >
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
            />
          </button>
        ) : rightIcon ? (
          <div 
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${iconSizeClasses[size]}`}
            style={{ color: iconColor }}
          >
            {rightIcon}
          </div>
        ) : null}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;