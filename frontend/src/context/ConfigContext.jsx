import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    mandalName: 'श्री अमर गणेश मित्र मंडळ',
    mandalTagline: 'भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!',
    festivalYear: 2026,
    sthapanaDate: '2026-08-28T09:00:00',
    visarjanDate: '2026-09-08T18:00:00',
    contactNumber: '+91 98765 43210',
    email: 'contact@shreeamarganesh.org',
    address: 'अमर गणेश चौक, शनिवार पेठ, पुणे, महाराष्ट्र - ४११ ०३०',
    mapLocation: 'https://maps.app.goo.gl/C6AwUKT4sz5xxSyP7',
    upiId: 'amarganesh@upi',
    bankDetails: {
      accountName: 'Shree Amar Ganesh Mitra Mandal',
      accountNumber: '9876002100045890',
      ifsc: 'MAHB0000123',
      bankName: 'Bank of Maharashtra'
    },
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://www.instagram.com/bappa_majha_offical_17?igsh=bnMyazE3aG91aTJv',
      youtube: 'https://youtube.com'
    },
    transparencyEnabled: true
  });

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/public/config');
      if (res.success && res.config) {
        setConfig(res.config);
      }
      
      const annRes = await api.get('/public/announcements');
      if (annRes.success && annRes.announcements) {
        setAnnouncements(annRes.announcements);
      }
    } catch (e) {
      console.warn('Config fetch warning (using defaults):', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, announcements, loading, refetchConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
