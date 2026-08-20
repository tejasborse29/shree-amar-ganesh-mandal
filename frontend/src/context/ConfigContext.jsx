import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    mandalName: 'श्री अमर गणेश मित्र मंडळ',
    mandalTagline: 'भक्ती परंपरेची… व्यवस्थापन आधुनिकतेचं!',
    festivalYear: 2026,
    financialYear: '2026-27',
    activeFestival: 'गणेशोत्सव',
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

  const [festivals, setFestivals] = useState([
    { id: '1', name: 'गणेशोत्सव', financialYear: '2026-27', festivalYear: 2026, isActive: true },
    { id: '2', name: 'नवरात्र', financialYear: '2026-27', festivalYear: 2026, isActive: false },
    { id: '3', name: 'शिवजयंती', financialYear: '2026-27', festivalYear: 2027, isActive: false },
    { id: '4', name: 'गुढीपाडवा', financialYear: '2026-27', festivalYear: 2027, isActive: false }
  ]);
  const [activeFestival, setActiveFestival] = useState({
    name: 'गणेशोत्सव',
    financialYear: '2026-27',
    festivalYear: 2026
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

      // Fetch festivals if logged in
      const token = localStorage.getItem('amgm_auth_token');
      if (token) {
        try {
          const festRes = await api.get('/festivals');
          if (festRes.success && festRes.festivals) {
            setFestivals(festRes.festivals);
            if (festRes.activeFestival) {
              setActiveFestival(festRes.activeFestival);
            }
          }
        } catch (err) {
          // fallback to defaults
        }
      }
    } catch (e) {
      console.warn('Config fetch warning (using defaults):', e);
    } finally {
      setLoading(false);
    }
  };

  const switchActiveFestival = async (festival) => {
    try {
      const res = await api.patch('/festivals/active', { festivalId: festival.id || festival._id, name: festival.name });
      if (res.success && res.activeFestival) {
        setActiveFestival(res.activeFestival);
        setFestivals(prev => prev.map(f => ({
          ...f,
          isActive: (f.id || f._id) === (res.activeFestival.id || res.activeFestival._id)
        })));
        return { success: true, message: res.message };
      }
    } catch (err) {
      // Local state update fallback
      setActiveFestival(festival);
      setFestivals(prev => prev.map(f => ({
        ...f,
        isActive: f.name === festival.name
      })));
      return { success: true };
    }
  };

  const createNewFestival = async (festivalData) => {
    try {
      const res = await api.post('/festivals', festivalData);
      if (res.success && res.festival) {
        setFestivals(prev => [res.festival, ...prev]);
        return { success: true, festival: res.festival };
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{
      config,
      festivals,
      activeFestival,
      announcements,
      loading,
      switchActiveFestival,
      createNewFestival,
      refetchConfig: fetchConfig
    }}>
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
