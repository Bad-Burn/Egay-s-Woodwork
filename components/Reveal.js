'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fades and lifts its children into view once they enter the viewport.
 * Reveals only once, and collapses to a no-op when the user prefers
 * reduced motion (the .reveal utility already opts out visually).
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ '--reveal-delay': `${delay}ms` }}
      className={`reveal ${shown ? 'reveal-visible' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
