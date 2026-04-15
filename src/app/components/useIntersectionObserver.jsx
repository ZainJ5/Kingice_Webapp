"use client";

import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver(
  elementRef, 
  { threshold = 0, root = null, rootMargin = '0px' }
) {
  const [entry, setEntry] = useState(null);
  const previousY = useRef(0);
  const direction = useRef(null); 

  useEffect(() => {
    const element = elementRef?.current;
    if (!element || typeof IntersectionObserver !== 'function') {
      return;
    }

    const observerCallback = ([entry]) => {
      if (previousY.current > entry.boundingClientRect.y) {
        direction.current = 'down';
      } else {
        direction.current = 'up';
      }
      
      previousY.current = entry.boundingClientRect.y;
      
      entry.scrollDirection = direction.current;
      setEntry(entry);
    };

    const observer = new IntersectionObserver(
      observerCallback,
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [elementRef, threshold, root, rootMargin]);

  return entry;
}