import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConfigContext = createContext(null);

const DEFAULT_CONFIG = {
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
};

const DEFAULT_FESTIVALS = [
  { id: '1', name: 'गणेशोत्सव', financialYear: '2026-27', festivalYear: 2026, isActive: true },
  { id: '2', name: 'नवरात्र', financialYear: '2026-27', festivalYear: 2026, isActive: false },
  { id: '3', name: 'शिवजयंती', financialYear: '2026-27', festivalYear: 2027, isActive: false },
  { id: '4', name: 'गुढीपाडवा', financialYear: '2026-27', festivalYear: 2027, isActive: false }
];

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('amgm_cached_config');
      return cached ? JSON.parse(cached) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [festivals, setFestivals] = useState(() => {
    try {
      const cached = localStorage.getItem('amgm_cached_festivals');
      return cached ? JSON.parse(cached) : DEFAULT_FESTIVALS;
    } catch {
      return DEFAULT_FESTIVALS;
    }
  });

  const [activeFestival, setActiveFestival] = useState(() => {
    try {
      const cached = localStorage.getItem('amgm_cached_active_festival');
      return cached ? JSON.parse(cached) : { name: 'गणेशोत्सव', financialYear: '2026-27', festivalYear: 2026 };
    } catch {
      return { name: 'गणेशोत्सव', financialYear: '2026-27', festivalYear: 2026 };
    }
  });

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/public/config');
      if (res.success && res.config) {
        setConfig(res.config);
        localStorage.setItem('amgm_cached_config', JSON.stringify(res.config));
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
            localStorage.setItem('amgm_cached_festivals', JSON.stringify(festRes.festivals));
            if (festRes.activeFestival) {
              setActiveFestival(festRes.activeFestival);
              localStorage.setItem('amgm_cached_active_festival', JSON.stringify(festRes.activeFestival));
            }
          }
        } catch {
          // Keep cached
        }
      }
    } catch (err) {
      console.warn('Silent config sync notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchActiveFestival = async (festival) => {
    try {
      setActiveFestival(festival);
      localStorage.setItem('amgm_cached_active_festival', JSON.stringify(festival));
      const res = await api.post(`/festivals/${festival.id || festival._id}/set-active`, {
        festivalId: festival.id || festival._id,
        name: festival.name
      });
      if (res.success) {
        if (res.festivals) {
          setFestivals(res.festivals);
          localStorage.setItem('amgm_cached_festivals', JSON.stringify(res.festivals));
        }
        if (res.activeFestival) {
          setActiveFestival(res.activeFestival);
          localStorage.setItem('amgm_cached_active_festival', JSON.stringify(res.activeFestival));
        }
        fetchConfig();
        return res;
      }
    } catch (e) {
      console.warn('Festival switch notice:', e);
    }
  };

  const createNewFestival = async (festData) => {
    const res = await api.post('/festivals', festData);
    if (res.success && res.festival) {
      const updated = res.festivals || [res.festival, ...festivals];
      setFestivals(updated);
      localStorage.setItem('amgm_cached_festivals', JSON.stringify(updated));
      return { success: true, festival: res.festival, message: res.message };
    }
    return { success: false, message: res.message || 'उत्सव जोडताना त्रुटी आली' };
  };

  const updateMandalConfig = async (newConfig) => {
    try {
      const res = await api.put('/settings', newConfig);
      if (res.success) {
        await fetchConfig();
        return { success: true, message: res.message || 'सेटिंग्ज यशस्वीपणे अद्यतनित झाल्या.' };
      }
      return { success: false, message: res.message || 'सेटिंग्ज अद्यतनित होऊ शकल्या नाहीत.' };
    } catch (err) {
      return { success: false, message: err.message || 'त्रुटी आली.' };
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
      refreshConfig: fetchConfig,
      refetchConfig: fetchConfig,
      switchActiveFestival,
      createNewFestival,
      updateMandalConfig
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
