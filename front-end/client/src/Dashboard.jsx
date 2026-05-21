import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, Calendar, QrCode, MapPin, Clock, UserCircle, 
  CheckCircle, Building, Settings, X, Globe, Bell, Moon, Shield 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [events, setEvents] = useState([]); 
  const [joinedEvents, setJoinedEvents] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    language: 'ms', 
    notifications: true,
    darkMode: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedSettings = localStorage.getItem('userSettings'); // Muat tetapan yang disave

    if (savedSettings) {
      setSystemSettings(JSON.parse(savedSettings));
    }

    if (!savedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role === 'admin') {
        navigate('/admin');
      } else {
        setUser(parsedUser);
        fetchData(parsedUser.p_id); 
      }
    }
  }, [navigate]);

  const fetchData = async (p_id) => {
    try {
      const resEvents = await axios.get('http://10.1.30.147:5000/api/admin/events');
      setEvents(resEvents.data.filter(ev => ev.status !== 'draft'));
      
      const resJoined = await axios.get(`http://10.1.30.147:5000/api/user/${p_id}/joined-events`);
      setJoinedEvents(resJoined.data);
    } catch (error) {
      console.error(systemSettings.language === 'ms' ? "Gagal memuat turun senarai acara" : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await axios.post('http://10.1.30.147:5000/api/user/join-event', { p_id: user.p_id, event_id: eventId });
      alert(systemSettings.language === 'ms' ? "Tahniah! Anda berjaya mendaftar ke acara ini." : "Congratulations! You have successfully registered for this event.");
      fetchData(user.p_id); 
    } catch (error) {
      alert(error.response?.data?.error || (systemSettings.language === 'ms' ? "Gagal menyertai acara." : "Failed to join event."));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(systemSettings)); // Simpan tetapan
    setIsSettingsModalOpen(false);
    alert(systemSettings.language === 'ms' ? "Tetapan berjaya disimpan!" : "Settings saved successfully!");
  };

  if (!user) return null;

  // ==========================================
  // KOMPONEN RENDER: MODAL TETAPAN
  // ==========================================
  const renderSettingsModal = () => {
    if (!isSettingsModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800">
          
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {systemSettings.language === 'ms' ? 'Tetapan Akaun' : 'Account Settings'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {systemSettings.language === 'ms' ? 'Urus pilihan sistem dan paparan anda.' : 'Manage your system preferences and appearance.'}
              </p>
            </div>
            <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
              <X size={24}/>
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-950/50">
            
            {/* BAHASA */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Globe size={20}/></div>
                {systemSettings.language === 'ms' ? 'Bahasa Aplikasi' : 'App Language'}
              </h3>
              <div className="space-y-3">
                 <select 
                   value={systemSettings.language} 
                   onChange={e => setSystemSettings({...systemSettings, language: e.target.value})} 
                   className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer"
                 >
                    <option value="ms">Bahasa Melayu (Malaysia)</option>
                    <option value="en">English (US)</option>
                 </select>
              </div>
            </div>

            {/* NOTIFIKASI */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Bell size={20}/></div>
                {systemSettings.language === 'ms' ? 'Notifikasi' : 'Notifications'}
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {systemSettings.language === 'ms' ? 'Pemberitahuan Emel' : 'Email Alerts'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {systemSettings.language === 'ms' ? 'Terima emel peringatan sebelum acara bermula.' : 'Receive email reminders before an event starts.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={systemSettings.notifications} 
                    onChange={e => setSystemSettings({...systemSettings, notifications: e.target.checked})} 
                  />
                  <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* MOD GELAP */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Moon size={20}/></div>
                  {systemSettings.language === 'ms' ? 'Penampilan' : 'Appearance'}
               </h3>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {systemSettings.language === 'ms' ? 'Mod Gelap (Dark Mode)' : 'Dark Mode'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {systemSettings.language === 'ms' ? 'Tukar paparan kepada tema gelap.' : 'Switch the display to a darker theme.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={systemSettings.darkMode} 
                    onChange={e => setSystemSettings({...systemSettings, darkMode: e.target.checked})} 
                  />
                  <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800 dark:peer-checked:bg-blue-500 shadow-inner"></div>
                </label>
              </div>
            </div>

          </div>

          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button 
              onClick={handleSaveSettings} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              <Shield size={18}/>
              {systemSettings.language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'}
            </button>
          </div>

        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER UTAMA
  // ==========================================
  return (
    // PEMBUNGKUS MOD GELAP (Ini yang mengaktifkan Dark Mode)
    <div className={`${systemSettings.darkMode ? 'dark' : ''}`}>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
        {/* NAVBAR */}
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-3 md:gap-6">
            <h1 className="text-2xl font-black text-blue-600 dark:text-blue-500 tracking-tight italic">HADIR</h1>
            <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 md:px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
              <span className="text-[10px] md:text-xs font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider mr-2">
                {systemSettings.language === 'ms' ? 'ID Anda:' : 'Your ID:'}
              </span>
              <span className="text-sm md:text-base font-black text-blue-700 dark:text-blue-400 tracking-widest">{user.p_id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            
            <button 
              onClick={() => setIsSettingsModalOpen(true)} 
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Settings size={22} />
              <span className="hidden sm:inline">{systemSettings.language === 'ms' ? 'Tetapan' : 'Settings'}</span>
            </button>

            <Link to="/profile" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <UserCircle size={22} />
              <span className="hidden sm:inline">{systemSettings.language === 'ms' ? 'Profil' : 'Profile'}</span>
            </Link>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut size={18} />
              <span className="hidden sm:inline">{systemSettings.language === 'ms' ? 'Keluar' : 'Logout'}</span>
            </button>
          </div>
        </nav>

        {/* KANDUNGAN UTAMA */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col items-center">
          
          <div className="w-full mb-6 md:mb-8 text-center md:text-left mt-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">
              {systemSettings.language === 'ms' ? 'Selamat datang,' : 'Welcome,'} <span className="text-blue-600 dark:text-blue-500">{user.full_name}</span>! 👋
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 inline-flex px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
              <Building size={18} className="text-blue-500 dark:text-blue-400"/>
              {user.koperasi || (systemSettings.language === 'ms' ? "Tiada Maklumat Koperasi" : "No Cooperative Info")}
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm md:text-base">
              {systemSettings.language === 'ms' ? 'Pilih acara di bawah dan daftar untuk mendapatkan Pas Masuk.' : 'Select an event below and register to get an Entry Pass.'}
            </p>
          </div>

          {loading ? (
            <div className="w-full p-12 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 dark:border-blue-500"></div></div>
          ) : events.length === 0 ? (
            <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={60} />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                {systemSettings.language === 'ms' ? 'Tiada Acara' : 'No Events'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                {systemSettings.language === 'ms' ? 'Pihak pengurusan belum memuat naik sebarang acara pada masa ini.' : 'Management has not uploaded any events at this time.'}
              </p>
            </div>
          ) : (
            events.map((event) => {
              const registrationData = joinedEvents.find(e => e.event_id === event.id);
              const isJoined = !!registrationData;
              const isAttended = isJoined ? registrationData.attended : false;

              return (
                <div key={event.id} className="w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 mb-8">
                  <div className="bg-blue-600 dark:bg-blue-700 p-8 md:p-10 text-white relative overflow-hidden">
                    <QrCode className="absolute -right-10 -top-10 opacity-10 w-64 h-64" />
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md mb-6 border border-white/20">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">{event.type}</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{event.title}</h2>
                      <p className="text-blue-100 dark:text-blue-50 mb-6 max-w-xl text-sm leading-relaxed">{event.description}</p>
                      <div className="flex flex-col sm:flex-row gap-4 text-white font-medium text-sm">
                        <p className="flex items-center gap-2"><MapPin size={16} className="text-blue-200"/> {event.location}</p>
                        <p className="flex items-center gap-2"><Clock size={16} className="text-blue-200"/> {event.date} ({event.time})</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-950/30">
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">
                      {systemSettings.language === 'ms' ? 'Status Pendaftaran & Kehadiran' : 'Registration & Attendance Status'}
                    </p>
                    
                    {isJoined ? (
                      isAttended ? (
                        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 p-8 rounded-3xl w-full max-w-sm shadow-sm animate-in zoom-in-95">
                          <div className="w-20 h-20 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 dark:shadow-none"><CheckCircle size={40} /></div>
                          <h3 className="text-2xl font-black text-green-800 dark:text-green-400">
                            {systemSettings.language === 'ms' ? 'Telah Disahkan' : 'Verified'}
                          </h3>
                          <p className="text-green-700 dark:text-green-500 font-medium mt-2">
                            {systemSettings.language === 'ms' ? 'Kehadiran anda telah direkodkan oleh sistem.' : 'Your attendance has been recorded by the system.'}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-8 rounded-3xl w-full max-w-sm animate-in zoom-in-95">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"><QrCode size={40} /></div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {systemSettings.language === 'ms' ? 'Pas Sedia Digunakan' : 'Pass Ready to Use'}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            {systemSettings.language === 'ms' ? 'Anda telah mendaftar. Sila imbas QR di kaunter acara.' : 'You are registered. Please scan the QR at the event counter.'}
                          </p>
                          <Link to="/scan" className="block w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-md transition-all mt-2 text-lg">
                            {systemSettings.language === 'ms' ? 'Buka Pengimbas QR' : 'Open QR Scanner'}
                          </Link>
                        </div>
                      )
                    ) : (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-8 rounded-3xl w-full max-w-sm animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={40} /></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                          {systemSettings.language === 'ms' ? 'Belum Menyertai' : 'Not Joined'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          {systemSettings.language === 'ms' ? 'Klik butang di bawah untuk menempah tempat anda di acara ini.' : 'Click the button below to reserve your spot in this event.'}
                        </p>
                        <button onClick={() => handleJoinEvent(event.id)} className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-4 rounded-xl font-bold shadow-md transition-all mt-2 text-lg">
                          {systemSettings.language === 'ms' ? 'Sertai Acara Ini' : 'Join This Event'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* RENDER MODAL TETAPAN */}
        {renderSettingsModal()}

      </div>
    </div>
  );
};

export default Dashboard;