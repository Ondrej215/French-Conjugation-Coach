'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// This component will handle enabling/disabling scroll
export default function ScrollingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isScrollablePage, setIsScrollablePage] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // To handle client-side mounting

  // Ensure we only access router after component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Check if the current page is '/classes' or '/classes/[class_id]'
      if (router.pathname.startsWith('/classes')) {
        setIsScrollablePage(true);
      } else {
        setIsScrollablePage(false);
      }
    }
  }, [isMounted, router.pathname]);

  useEffect(() => {
    // Apply overflow styling dynamically
    if (isScrollablePage) {
      document.body.style.overflowY = 'auto'; // Enable scrolling
    } else {
      document.body.style.overflowY = 'hidden'; // Disable scrolling
    }
  }, [isScrollablePage]);

  if (!isMounted) {
    // Return null while waiting for the component to mount on the client
    return null;
  }

  return (
    <div>
      {children}
    </div>
  );
}