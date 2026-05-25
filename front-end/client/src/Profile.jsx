import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, ArrowLeft, Save, X, Edit3, CheckCircle2, UserCircle, Building } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', koperasi: ''
  });

  // --- STATE TETAPAN (LANGUAGE & DARK MODE) ---
  const [systemSettings, setSystemSettings] = useState({
    language: 'ms',
    darkMode: false
  });

  useEffect(() => {
    // 1. Muat Tetapan Sistem dari LocalStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSystemSettings(JSON.parse(savedSettings));
    }

    // 2. Muat Data Pengguna
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setFormData({
        full_name: parsedUser.full_name,
        email: parsedUser.email,
        phone: parsedUser.phone,
        koperasi: parsedUser.koperasi || '' 
      });
    }
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage({ type: '', text: '' });

    try {
      const res = await axios.put('https://hadir-backend.onrender.com/api/user/update-profile', {
        p_id: user.p_id,
        ...formData
      });

      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ 
        type: 'success', 
        text: systemSettings.language === 'ms' ? 'Profil berjaya dikemaskini!' : 'Profile updated successfully!' 
      });
      setIsEditing(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: systemSettings.language === 'ms' ? 'Gagal mengemaskini profil. Sila cuba lagi.' : 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    // PEMBUNGKUS MOD GELAP
    <div className={`${systemSettings.darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        
        {/* NAVBAR */}
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center shadow-sm sticky top-0 z-50 transition-colors">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="ml-4 font-bold text-slate-800 dark:text-white text-lg">
            {systemSettings.language === 'ms' ? 'Profil Saya' : 'My Profile'}
          </h1>
        </nav>

        <main className="max-w-2xl mx-auto p-4 md:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
            
            {/* Header Biru */}
            <div className="bg-blue-600 dark:bg-blue-700 h-32 relative">
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 p-1 shadow-lg transition-colors">
                     <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <UserCircle size={60} />
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-16 pb-8 px-6 md:px-12 text-center">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">{user.full_name}</h2>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm tracking-widest mt-1 uppercase">ID: {user.p_id}</p>
              
              {message.text && (
                <div className={`mt-6 p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/50' 
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50'
                }`}>
                  {message.type === 'success' && <CheckCircle2 size={16} />} {message.text}
                </div>
              )}
            </div>

            <form onSubmit={handleUpdate} className="p-6 md:p-12 pt-0 space-y-6">
              <div className="space-y-4 text-left">
                
                {/* Nama Penuh */}
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">
                    {systemSettings.language === 'ms' ? 'Nama Penuh' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input 
                      disabled={!isEditing} type="text" 
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 dark:text-white' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-300'
                      }`} 
                      value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required 
                    />
                  </div>
                </div>

                {/* Koperasi */}
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">
                    {systemSettings.language === 'ms' ? 'Koperasi / Organisasi' : 'Cooperative / Organization'}
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input 
                      disabled={!isEditing} type="text" 
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 dark:text-white' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-300'
                      }`} 
                      value={formData.koperasi} onChange={(e) => setFormData({...formData, koperasi: e.target.value})} required 
                    />
                  </div>
                </div>

                {/* Emel */}
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">
                    {systemSettings.language === 'ms' ? 'Alamat Emel' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input 
                      disabled={!isEditing} type="email" 
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 dark:text-white' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-300'
                      }`} 
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required 
                    />
                  </div>
                </div>

                {/* No Telefon */}
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">
                    {systemSettings.language === 'ms' ? 'No. Telefon' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input 
                      disabled={!isEditing} type="text" 
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 dark:text-white' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-300'
                      }`} 
                      value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required 
                    />
                  </div>
                </div>

              </div>

              <div className="pt-6">
                {!isEditing ? (
                  <button 
                    type="button" onClick={() => setIsEditing(true)} 
                    className="w-full bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-lg active:scale-95"
                  >
                    <Edit3 size={18} /> {systemSettings.language === 'ms' ? 'Edit Profil' : 'Edit Profile'}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => { setIsEditing(false); setFormData({ full_name: user.full_name, email: user.email, phone: user.phone, koperasi: user.koperasi }); }} 
                      className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      <X size={18} /> {systemSettings.language === 'ms' ? 'Batal' : 'Cancel'}
                    </button>
                    <button 
                      type="submit" disabled={loading} 
                      className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} /> {systemSettings.language === 'ms' ? 'Simpan' : 'Save'}</>}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
          
          <p className="mt-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            {systemSettings.language === 'ms' 
              ? 'Maklumat ini digunakan untuk pendaftaran acara anda.' 
              : 'This information is used for your event registrations.'}
          </p>
        </main>
      </div>
    </div>
  );
};

export default Profile;