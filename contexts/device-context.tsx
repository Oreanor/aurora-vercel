'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceContextType {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isRealMobile: boolean; // Based on User-Agent, not window size
  hasTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

/**
 * Detects device type based on multiple factors:
 * - User-Agent string
 * - Touch support
 * - Screen size
 * - Device pixel ratio
 */
function detectDeviceType(): DeviceType {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return 'desktop'; // Default to desktop for SSR
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile devices via User-Agent
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  
  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Get screen dimensions
  const screenWidth = window.screen.width;
  const viewportWidth = window.innerWidth;
  
  // Check device pixel ratio (high DPI might indicate mobile)
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Tablet detection: typically 768px - 1024px width with touch support
  const isTabletSize = (viewportWidth >= 768 && viewportWidth <= 1024) || 
                       (screenWidth >= 768 && screenWidth <= 1024);
  
  // Mobile detection: small screen OR mobile UA OR (touch support AND small screen)
  const isMobileSize = viewportWidth < 768 || screenWidth < 768;
  
  // Desktop detection: large screen without mobile indicators
  const isDesktopSize = viewportWidth >= 1024 && screenWidth >= 1024;
  
  // Determine device type with priority:
  // 1. Mobile UA + small screen = mobile
  // 2. Tablet size + touch = tablet
  // 3. Desktop size + no mobile UA = desktop
  // 4. Fallback based on screen size
  
  if (isMobileUA && isMobileSize) {
    return 'mobile';
  }
  
  if (isTabletSize && hasTouch) {
    return 'tablet';
  }
  
  if (isDesktopSize && !isMobileUA) {
    return 'desktop';
  }
  
  // Fallback logic
  if (isMobileSize || (hasTouch && viewportWidth < 1024)) {
    return 'mobile';
  }
  
  if (isTabletSize) {
    return 'tablet';
  }
  
  return 'desktop';
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  // Detect real mobile device based on User-Agent (stable, doesn't change with window resize)
  const [isRealMobile, setIsRealMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    }
    return false;
  });

  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    if (typeof window !== 'undefined') {
      return detectDeviceType();
    }
    return 'desktop';
  });
  
  const [hasTouch, setHasTouch] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });
  
  const [screenWidth, setScreenWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1920;
  });
  
  const [screenHeight, setScreenHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight;
    }
    return 1080;
  });

  useEffect(() => {
    // Function to update device type and screen dimensions
    const updateDeviceInfo = () => {
      setDeviceType(detectDeviceType());
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
      setHasTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize events (with debounce for performance)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDeviceInfo, 150);
    };

    // Listen for orientation changes (mobile devices)
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Memoize computed values
  const value = useMemo(() => ({
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isRealMobile,
    hasTouch,
    screenWidth,
    screenHeight,
  }), [deviceType, isRealMobile, hasTouch, screenWidth, screenHeight]);

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}

