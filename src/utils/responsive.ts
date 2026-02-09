/**
 * Responsive utilities for admin app
 * Ensures the app works well on both mobile and desktop
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isTablet = width >= 768;
export const isDesktop = width >= 1024;
export const isMobile = width < 768;

export const getResponsiveValue = <T,>(mobile: T, tablet: T, desktop?: T): T => {
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet) return tablet;
  return mobile;
};

export const getColumnCount = (): number => {
  if (isDesktop) return 3;
  if (isTablet) return 2;
  return 1;
};

export const getCardWidth = (): number | string => {
  if (isDesktop) return '30%';
  if (isTablet) return '45%';
  return '100%';
};

export const getPadding = (): number => {
  if (isDesktop) return 24;
  if (isTablet) return 20;
  return 16;
};

export const getFontSize = {
  title: isDesktop ? 28 : isTablet ? 24 : 20,
  heading: isDesktop ? 22 : isTablet ? 20 : 18,
  body: isDesktop ? 16 : isTablet ? 15 : 14,
  small: isDesktop ? 14 : isTablet ? 13 : 12,
};




