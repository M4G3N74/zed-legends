import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

// Cache for prefetched pages
const pageCache = new Map();
const prefetchQueue = new Set();

export function useInstantNavigation() {
  const router = useRouter();
  const prefetchTimeoutRef = useRef(null);

  // Prefetch a page
  const prefetchPage = async (href) => {
    if (pageCache.has(href) || prefetchQueue.has(href)) return;
    
    prefetchQueue.add(href);
    try {
      await router.prefetch(href);
      pageCache.set(href, true);
    } catch (error) {
      console.warn('Failed to prefetch:', href, error);
    } finally {
      prefetchQueue.delete(href);
    }
  };

  // Navigate instantly
  const navigateInstant = async (href) => {
    // If already on the page, do nothing
    if (router.asPath === href) return;
    
    // Navigate immediately - Next.js will handle the rest
    await router.push(href);
  };

  // Prefetch on hover with delay
  const handleMouseEnter = (href) => {
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchPage(href);
    }, 100); // Small delay to avoid excessive prefetching
  };

  const handleMouseLeave = () => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    navigateInstant,
    prefetchPage,
    handleMouseEnter,
    handleMouseLeave,
    isPageCached: (href) => pageCache.has(href)
  };
}

// Enhanced Link component with instant navigation
export function InstantLink({ href, children, className, ...props }) {
  const { navigateInstant, handleMouseEnter, handleMouseLeave } = useInstantNavigation();

  const handleClick = (e) => {
    e.preventDefault();
    navigateInstant(href);
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={() => handleMouseEnter(href)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </a>
  );
}