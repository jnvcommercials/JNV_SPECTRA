import { useEffect } from 'react';

export const useNetworkStatus = () => {
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is back online');
    };

    const handleOffline = () => {
      console.log('Network is offline');
      // Redirect to network error page when network goes offline
      window.location.href = '/network-error';
    };

    // Check initial network status
    if (!navigator.onLine) {
      handleOffline();
    }

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}; 