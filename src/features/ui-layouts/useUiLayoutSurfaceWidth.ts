import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export function useUiLayoutSurfaceWidth(fallbackWidth = 390) {
  const [width, setWidth] = useState(() => {
    try {
      return Dimensions.get('window').width || fallbackWidth;
    } catch {
      return fallbackWidth;
    }
  });

  useEffect(() => {
    try {
      const updateWidth = ({ window }: { window: { width: number } }) => {
        setWidth(window.width || fallbackWidth);
      };

      const subscription = Dimensions.addEventListener('change', updateWidth);
      return () => subscription.remove();
    } catch {
      return undefined;
    }
  }, [fallbackWidth]);

  return width;
}
