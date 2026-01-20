
import React, { useState, useEffect, useCallback } from 'react';
import { LocationData, ZmanimData, AppSettings } from './types';
import { fetchZmanim } from './services/zmanimService';
import { getDailyInsight } from './services/geminiService';
import Clock from './components/Clock';
import ZmanCard from './components/ZmanCard';
import AnnouncementBanner from './components/AnnouncementBanner';
import EditSettingsModal from './components/EditSettingsModal';

const DEFAULT_SETTINGS: AppSettings = {
  announcements: [
    "ברוכים הבאים לבית הכנסת!",
    "נא לשמור על קדושת המקום.",
    "הציבור מוזמן לשיעור דף היומי לאחר תפילת שחרית.",
    "נא לכבות טלפונים ניידים בכניסה."
  ],
  prayers: [
    { id: 'p1', name: 'שחרית מנין א׳', time: '06:30' },
    { id: 'p2', name: 'שחרית מנין ב׳', time: '08:00' },
    { id: 'p3', name: 'מנחה וערבית', time: '15 דק׳ לפני השקיעה' }
  ],
  lessons: [
    { id: 'l1', name: 'שיעור דף היומי', time: '18:00' },
    { id: 'l2', name: 'שיעור הלכה', time: 'בין מנחה לערבית' }
  ]
};

const App: React.FC = () => {
  const [location, setLocation] = useState<LocationData>({ lat: 31.7683, lng: 35.2137 }); // Default: Jerusalem
  const [zmanim, setZmanim] = useState<ZmanimData | null>(null);
  const [insight, setInsight] = useState<string>('טוען דבר תורה...');
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('synagogue_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('synagogue_settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  const initData = useCallback(async (loc: LocationData) => {
    try {
      const data = await fetchZmanim(loc);
      setZmanim(data);
      const aiInsight = await getDailyInsight(data.parasha, data.hebrew);
      setInsight(aiInsight);
    } catch (err) {
      console.error("Init Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLoc);
          initData(newLoc);
        },
        () => {
          initData(location);
        }
      );
    } else {
      initData(location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !zmanim) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <AnnouncementBanner messages={settings.announcements} />
        <div className="bg-slate-950/40 py-2 border-b border-slate-800 text-center">
          <p className="text-amber-500/80 font-medium text-lg italic tracking-wide">
            מוקדש לע"נ יעל בת שפרה ת.נ.צ.ב.ה
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-slate-300">מעדכן נתונים למיקומך...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <AnnouncementBanner messages={settings.announcements} />
      
      {/* Dedication Header */}
      <div className="bg-slate-900/60 py-3 border-b border-slate-800 text-center shadow-inner">
        <p className="text-amber-500 font-semibold text-xl italic tracking-wider">
          מוקדש לע"נ יעל בת שפרה ת.נ.צ.ב.ה
        </p>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-6 w-full relative">
        {/* Settings Trigger */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="fixed bottom-6 left-6 p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-400 hover:text-amber-500 transition-all shadow-xl z-40"
          title="הגדרות"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Header Section */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <Clock />
          </div>
          
          <div className="lg:col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-extrabold text-white">לוח בית הכנסת</h1>
              <div className="text-left">
                <span className="inline-block px-4 py-1 bg-amber-600 rounded-full text-sm font-bold text-white shadow-lg">
                  פרשת {zmanim.parasha}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-xl border-r-4 border-amber-500 italic text-slate-200">
              <p className="text-lg leading-relaxed">
                "{insight}"
              </p>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-amber-500 border-b border-amber-500/30 pb-2">זמני הבוקר</h2>
            <ZmanCard label="עלות השחר" time={zmanim.times.alotHaShachar} />
            <ZmanCard label="זמן טלית ותפילין" time={zmanim.times.misheyakir} highlight />
            <ZmanCard label="הנץ החמה" time={zmanim.times.sunrise} highlight />
            <ZmanCard label="סוף זמן קריאת שמע (מג״א)" time={zmanim.times.sofZmanShmaMGA} />
            <ZmanCard label="סוף זמן קריאת שמע (גר״א)" time={zmanim.times.sofZmanShmaGRA} highlight />
            <ZmanCard label="סוף זמן תפילה (גר״א)" time={zmanim.times.sofZmanTfillaGRA} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-amber-500 border-b border-amber-500/30 pb-2">צהריים וערב</h2>
            <ZmanCard label="חצות היום" time={zmanim.times.chatzot} />
            <ZmanCard label="מנחה גדולה" time={zmanim.times.minchaGedola} />
            <ZmanCard label="מנחה קטנה" time={zmanim.times.minchaKetana} />
            <ZmanCard label="פלג המנחה" time={zmanim.times.plagHaMincha} />
            <ZmanCard label="שקיעת החמה" time={zmanim.times.sunset} highlight />
            <ZmanCard label="צאת הכוכבים" time={zmanim.times.tzeitHaKochavim} highlight />
          </section>

          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-amber-500 border-b border-amber-500/30 pb-2">תפילות ושיעורים</h2>
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 space-y-4 shadow-xl">
                {settings.prayers.map((prayer) => (
                  <div key={prayer.id} className="flex justify-between items-center group">
                    <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{prayer.name}</span>
                    <span className="font-bold text-amber-400 font-varela">{prayer.time}</span>
                  </div>
                ))}
                
                <div className="pt-4 mt-2 border-t border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">שיעורי תורה</h4>
                  {settings.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">{lesson.name}</span>
                      <span className="text-sm font-semibold text-slate-200">{lesson.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {zmanim.times.candleLighting ? (
              <div className="p-6 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9 9H2L7 14L5 21L12 17L19 21L17 14L22 9H15L12 2Z"/></svg>
                </div>
                <h3 className="text-lg font-bold opacity-90 relative z-10">הדלקת נרות שבת</h3>
                <div className="text-5xl font-black mt-2 font-varela relative z-10">{zmanim.times.candleLighting}</div>
              </div>
            ) : (
               <div className="p-6 bg-slate-800/20 rounded-2xl border border-slate-700 text-center italic text-slate-500 text-sm">
                 זמני שבת יופיעו בימי שישי
               </div>
            )}
          </section>
        </main>

        <footer className="text-center py-10 text-slate-600 text-xs border-t border-slate-900 mt-8">
          הלוח מבוסס מיקום בזמן אמת ({location.lat.toFixed(2)}, {location.lng.toFixed(2)}) | © {new Date().getFullYear()}
        </footer>

        {isSettingsOpen && (
          <EditSettingsModal 
            settings={settings} 
            onSave={saveSettings} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
