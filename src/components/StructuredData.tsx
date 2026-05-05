import { useEffect } from 'react';

const SITE_URL = 'https://universflow.in';

const StructuredData = () => {
  useEffect(() => {
    const existing = document.querySelectorAll('script[type="application/ld+json"]');
    existing.forEach(el => el.remove());

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Univers Flow",
      "url": SITE_URL,
      "logo": "https://storage.googleapis.com/gpt-engineer-file-uploads/d6CK1hptEYS0iYCrQMmYcx7HukD2/uploads/1768315312999-Screenshot 2026-01-13 201134.png",
      "description": "Premium free music streaming platform  Stream unlimited songs, create playlists, download for offline listening.",
      "founder": {
        "@type": "Person",
        "name": "Universflow Team"
      },
      "sameAs": [
        "https://twitter.com/UniversFlow"
      ]
    };

    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Univers Flow",
      "url": SITE_URL,
      "description": "Stream and download unlimited music for free. Discover millions of songs, create playlists, and listen offline. The best free music streaming app.",
      "applicationCategory": "MusicApplication",
      "operatingSystem": "Web, Android, iOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Person",
        "name": "Universflow Team"
      },
      "featureList": [
        "Free music streaming",
        "Offline music download",
        "Playlist creation",
        "High quality audio",
        "No ads for premium",
        "Cross-platform sync",
        "AI-powered recommendations",
        "Equalizer settings",
        "Sleep timer",
        "Social sharing"
      ],
      "screenshot": "https://storage.googleapis.com/gpt-engineer-file-uploads/d6CK1hptEYS0iYCrQMmYcx7HukD2/social-images/social-1768315544947-Screenshot 2026-01-13 201134.png",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "15000",
        "bestRating": "5"
      }
    };

    const musicServiceSchema = {
      "@context": "https://schema.org",
      "@type": "MusicStreamingService",
      "name": "Univers Flow",
      "url": SITE_URL,
      "description": "The best free music streaming app. Listen to millions of songs, discover new artists, and download music for offline listening. ",
      "provider": {
        "@type": "Person",
        "name": "Universflow Team"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier with optional premium features"
      }
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is Univers Flow free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Univers Flow is completely free to use. You can stream unlimited music, create playlists, and download songs for offline listening without paying anything. Visit https://universflow.in to start listening now."
          }
        },
        {
          "@type": "Question",
          "name": "Can I download music for offline listening?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Univers Flow allows you to download any song directly to your device for offline listening. No internet connection required once downloaded."
          }
        },
        {
          "@type": "Question",
          "name": "Who created Univers Flow?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Univers Flow was designed and developed by Universflow Team as a premium music streaming experience for everyone."
          }
        },
        {
          "@type": "Question",
          "name": "What devices support Univers Flow?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Univers Flow works on all modern web browsers, Android devices, and iOS devices. It's available as a Progressive Web App (PWA) and native Android app."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best free music streaming app?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Univers Flow is the best free music streaming app. It offers unlimited streaming, offline downloads, playlist creation, high-quality audio, equalizer settings, and much more — all completely free at https://universflow.in."
          }
        },
        {
          "@type": "Question",
          "name": "How do I install Univers Flow on my phone?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Visit https://universflow.in on your phone's browser. On Android, tap 'Install App' or use the browser menu to add it to your home screen. You can also download the native Android APK from the website."
          }
        }
      ]
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${SITE_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Search Music",
          "item": `${SITE_URL}/search`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "My Library",
          "item": `${SITE_URL}/library`
        }
      ]
    };

    const softwareAppSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Univers Flow - Free Music Streaming",
      "url": SITE_URL,
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Android, Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "15000",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Universflow Team"
      }
    };

    const schemas = [organizationSchema, webAppSchema, musicServiceSchema, faqSchema, breadcrumbSchema, softwareAppSchema];
    
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(el => el.remove());
    };
  }, []);

  return null;
};

export default StructuredData;
