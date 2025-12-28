// hooks/useScrollMemory.js
import { useEffect, useRef } from 'react';

export const useScrollMemory = (componentKey = 'default') => {
  const containerRef = useRef(null);

  useEffect(() => {
    const storageKey = `scroll-${componentKey}`;
    
    // Восстановление позиции с задержкой
    const savedPosition = sessionStorage.getItem(storageKey);
    
    if (containerRef.current && savedPosition !== null) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = parseInt(savedPosition, 10);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [componentKey]);

  useEffect(() => {
    const storageKey = `scroll-${componentKey}`;
    
    const handleScroll = () => {
      if (containerRef.current) {
        sessionStorage.setItem(
          storageKey, 
          containerRef.current.scrollTop.toString()
        );
      }
    };

    const currentRef = containerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [componentKey]);

  return containerRef;
};