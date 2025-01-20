export const COLORS = {
  primary: '#C68B59',
  secondary: '#8B4513',
  accent: '#D2691E',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFC107',
  info: '#2196F3',
  
  // Base colors
  text: '#1A1A1A',
  textLight: '#757575',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F0F0',
  
  // Additional colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  grayLight: '#E0E0E0',
  grayDark: '#616161',
  
  // Gradients
  gradientStart: 'rgba(198, 139, 89, 0.8)',
  gradientEnd: 'rgba(139, 69, 19, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System-Medium',
    semiBold: 'System-SemiBold',
    bold: 'System-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const LAYOUT = {
  screenPadding: SPACING.xl,
  contentWidth: '100%',
  maxWidth: 500,
}; 