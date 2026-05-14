import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PreloadResources = () => {
  const location = useLocation();

  useEffect(() => {
    // Preload critical resources based on current route
    const preloadResources = () => {
      // Preload fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
      fontPreload.as = 'style';
      document.head.appendChild(fontPreload);

      // Preload critical images based on route
      const criticalImages = {
        '/': ['/images/hero.jpg', '/images/logo.png'],
        '/about': ['/images/about-hero.jpg'],
        '/contact': ['/images/contact-bg.jpg'],
        '/events': ['/images/events-hero.jpg'],
        '/venues': ['/images/venues-hero.jpg'],
      };

      const routeImages = criticalImages[location.pathname as keyof typeof criticalImages] || [];
      routeImages.forEach(imagePath => {
        const imgPreload = document.createElement('link');
        imgPreload.rel = 'preload';
        imgPreload.href = imagePath;
        imgPreload.as = 'image';
        document.head.appendChild(imgPreload);
      });
    };

    preloadResources();
  }, [location]);

  return null;
};

export default PreloadResources; 