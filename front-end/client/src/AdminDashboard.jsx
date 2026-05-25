import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut, 
  Search, MoreHorizontal, Eye, KeyRound, X, 
  TrendingUp, Users2, CalendarDays, Plus, MapPin, Edit2, Trash2,
  Menu, QrCode, Globe, Bell, Moon, Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userEventHistory, setUserEventHistory] = useState([]);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false); 
  const [eventForm, setEventForm] = useState({
    id: null, title: '', description: '', date: '', time: '', location: '', type: 'Seminar', capacity: 50, status: 'published'
  });
  const [qrModalEvent, setQrModalEvent] = useState(null);

  const [selectedEventInfo, setSelectedEventInfo] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);

  // --- STATE TETAPAN (SETTINGS) ---
  const [systemSettings, setSystemSettings] = useState({
    language: 'ms', 
    notifications: true,
    darkMode: false,
  });

  // ==========================================
  // KESAN PENGGUNA & MUAT TURUN DATA
  // ==========================================
  useEffect(() => {
    // 1. Muat Tetapan Admin dari LocalStorage
    const savedAdminSettings = localStorage.getItem('adminSettings');
    if (savedAdminSettings) {
      setSystemSettings(JSON.parse(savedAdminSettings));
    }

    // 2. Semak Sesi Pengguna
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchAllData();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const resParticipants = await axios.get('https://hadir-backend.onrender.com/api/admin/participants');
      setParticipants(resParticipants.data);
      const resEvents = await axios.get('https://hadir-backend.onrender.com/api/admin/events');
      setEvents(resEvents.data);
    } catch (error) {
      console.error(systemSettings.language === 'ms' ? "Gagal memuat turun data" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setActiveDropdown(null);
    try {
      const res = await axios.get(`https://hadir-backend.onrender.com/api/admin/participants/${user.p_id}/history`);
      setUserEventHistory(res.data);
    } catch (err) {
      console.error("Gagal ambil sejarah acara");
    }
  };

  const handleViewEventParticipants = async (event) => {
    setSelectedEventInfo(event);
    try {
      const res = await axios.get(`https://hadir-backend.onrender.com/api/admin/events/${event.id}/participants`);
      setEventParticipants(res.data);
    } catch (err) {
      console.error("Gagal ambil senarai peserta acara");
    }
  };

  const openCreateModal = () => {
    setEventForm({ id: null, title: '', description: '', date: '', time: '', location: '', type: 'Seminar', capacity: 50, status: 'published' });
    setIsEditingEvent(false);
    setIsEventModalOpen(true);
  };

  const openEditModal = (event) => {
    setEventForm(event);
    setIsEditingEvent(true);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (isEditingEvent) {
        await axios.put(`https://hadir-backend.onrender.com/api/admin/events/${eventForm.id}`, eventForm);
        alert(systemSettings.language === 'ms' ? "Acara dikemas kini!" : "Event updated!");
      } else {
        await axios.post('https://hadir-backend.onrender.com/api/admin/events', eventForm);
        alert(systemSettings.language === 'ms' ? "Acara baharu dicipta!" : "New event created!");
      }
      setIsEventModalOpen(false);
      fetchAllData();
    } catch (error) { 
      alert(systemSettings.language === 'ms' ? "Ralat menyimpan." : "Error saving."); 
    }
  };

  const handleDeleteEvent = async (id, title) => {
    const confirmMsg = systemSettings.language === 'ms' ? `Padam acara "${title}" secara kekal?` : `Permanently delete event "${title}"?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await axios.delete(`https://hadir-backend.onrender.com/api/admin/events/${id}`);
      fetchAllData();
    } catch (error) { 
      alert(systemSettings.language === 'ms' ? "Ralat padam acara." : "Error deleting event."); 
    }
  };

  const handleResetPassword = async (p_id, name) => {
    setActiveDropdown(null);
    const confirmMsg = systemSettings.language === 'ms' ? `Reset password ${name} kepada 'pass123'?` : `Reset password for ${name} to 'pass123'?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await axios.post('https://hadir-backend.onrender.com/api/admin/reset-password', { p_id });
      alert(res.data.message);
    } catch (error) { 
      alert(systemSettings.language === 'ms' ? "Ralat reset password." : "Error resetting password."); 
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(systemSettings));
    alert(systemSettings.language === 'ms' ? "Tetapan berjaya disimpan!" : "Settings saved successfully!");
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };
  
  const handleTabChange = (tab) => { setActiveTab(tab); setIsSidebarOpen(false); };

  const filteredUsers = participants.filter(p => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.p_id.includes(searchQuery));

  // ==========================================
  // KOMPONEN RENDER: DASHBOARD
  // ==========================================
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{systemSettings.language === 'ms' ? 'Gambaran keseluruhan panel admin anda' : 'Overview of your admin panel'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{systemSettings.language === 'ms' ? 'Jumlah Pengguna' : 'Total Users'}</p>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users2 size={20}/></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{participants.length}</h3>
          <p className="flex items-center text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
            <TrendingUp size={14} className="mr-1"/> {systemSettings.language === 'ms' ? 'Aktif dalam sistem' : 'Active in system'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{systemSettings.language === 'ms' ? 'Acara Aktif' : 'Active Events'}</p>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><CalendarDays size={20}/></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{events.length}</h3>
          <p className="flex items-center text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
            <TrendingUp size={14} className="mr-1"/> {systemSettings.language === 'ms' ? 'Acara didaftarkan' : 'Registered events'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{systemSettings.language === 'ms' ? 'Status Sistem' : 'System Status'}</p>
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><Shield size={20}/></div>
          </div>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">{systemSettings.language === 'ms' ? 'Dalam Talian & Selamat' : 'Online & Secure'}</h3>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // KOMPONEN RENDER: USERS
  // ==========================================
  const renderUsers = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{systemSettings.language === 'ms' ? 'Pengurusan Pengguna' : 'User Management'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{systemSettings.language === 'ms' ? 'Lihat butiran pengguna dan reset kata laluan' : 'View user details and reset passwords'}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={systemSettings.language === 'ms' ? "Cari nama atau ID..." : "Search by name or ID..."} 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
              value={searchQuery} 
              onChange={(e)=>setSearchQuery(e.target.value)} 
            />
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">{filteredUsers.length} {systemSettings.language === 'ms' ? 'pengguna' : 'users'}</span>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left min-w-max">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="border-b dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">{systemSettings.language === 'ms' ? 'Pengguna' : 'User'}</th>
                <th className="p-4">{systemSettings.language === 'ms' ? 'Peranan' : 'Role'}</th>
                <th className="p-4 text-center">{systemSettings.language === 'ms' ? 'Tindakan' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {loading ? <tr><td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">{systemSettings.language === 'ms' ? 'Memuatkan...' : 'Loading...'}</td></tr> : 
               filteredUsers.map(user => (
                <tr key={user.p_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-500 dark:text-slate-400">{user.p_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">{user.full_name.charAt(0).toUpperCase()}</div>
                      <div><p className="text-sm font-bold text-slate-800 dark:text-white">{user.full_name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p></div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{systemSettings.language === 'ms' ? 'Peserta' : 'Participant'}</td>
                  <td className="p-4 text-center relative">
                    <button onClick={()=>setActiveDropdown(activeDropdown === user.p_id ? null : user.p_id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 dark:text-slate-500"><MoreHorizontal size={18}/></button>
                    {activeDropdown === user.p_id && (
                      <div className="absolute right-10 top-10 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl py-1 z-10 w-48 text-left animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={()=>handleViewUserDetails(user)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Eye size={16} className="text-slate-400"/> {systemSettings.language === 'ms' ? 'Lihat Butiran' : 'View Details'}</button>
                        <button onClick={()=>handleResetPassword(user.p_id, user.full_name)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><KeyRound size={16} className="text-slate-400"/> {systemSettings.language === 'ms' ? 'Reset Kata Laluan' : 'Reset Password'}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // KOMPONEN RENDER: EVENTS
  // ==========================================
  const renderEvents = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{systemSettings.language === 'ms' ? 'Acara & Seminar' : 'Events & Seminars'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{systemSettings.language === 'ms' ? 'Klik pada kad acara untuk melihat senarai peserta.' : 'Click on an event card to view the participant list.'}</p>
        </div>
        <button onClick={openCreateModal} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-transform active:scale-95">
          <Plus size={18} /> {systemSettings.language === 'ms' ? 'Cipta Acara' : 'Create Event'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl">
            <CalendarDays className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">{systemSettings.language === 'ms' ? 'Tiada acara direkodkan.' : 'No events recorded.'}</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-lg dark:shadow-none transition-all relative group flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex gap-2 items-center">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider ${event.status === 'published' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{event.status}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">{event.type}</span>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg">
                  <button onClick={(e) => { e.stopPropagation(); setQrModalEvent(event); }} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30" title={systemSettings.language === 'ms' ? 'Papar QR Code' : 'Show QR Code'}><QrCode size={16}/></button>
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(event); }} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30" title={systemSettings.language === 'ms' ? 'Edit Acara' : 'Edit Event'}><Edit2 size={16}/></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id, event.title); }} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30" title={systemSettings.language === 'ms' ? 'Padam Acara' : 'Delete Event'}><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="cursor-pointer flex-grow flex flex-col relative z-0" onClick={() => handleViewEventParticipants(event)}>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 flex-grow">{event.description}</p>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                  <p className="flex items-center gap-2"><CalendarDays size={16} className="text-slate-400 dark:text-slate-500"/> {event.date} | {event.time}</p>
                  <p className="flex items-center gap-2"><MapPin size={16} className="text-slate-400 dark:text-slate-500"/> {event.location}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ==========================================
  // KOMPONEN RENDER: SETTINGS
  // ==========================================
  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {systemSettings.language === 'ms' ? 'Tetapan Sistem' : 'System Settings'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {systemSettings.language === 'ms' ? 'Urus tetapan sistem dan paparan papan pemuka anda.' : 'Manage your system preferences and dashboard appearance.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Globe size={20}/></div>
              {systemSettings.language === 'ms' ? 'Bahasa & Wilayah' : 'Language & Region'}
            </h3>
            <div className="space-y-4">
               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                 {systemSettings.language === 'ms' ? 'Pilih Bahasa' : 'Select Language'}
               </label>
               <select 
                 value={systemSettings.language} 
                 onChange={e => setSystemSettings({...systemSettings, language: e.target.value})} 
                 className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer"
               >
                  <option value="ms">Bahasa Melayu (Malaysia)</option>
                  <option value="en">English (US)</option>
               </select>
               <p className="text-xs text-slate-500 dark:text-slate-400">
                 {systemSettings.language === 'ms' ? 'Bahasa ini akan digunakan di seluruh antaramuka admin.' : 'This language will be applied across the entire admin interface.'}
               </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Bell size={20}/></div>
              {systemSettings.language === 'ms' ? 'Notifikasi Sistem' : 'System Notifications'}
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 gap-4">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {systemSettings.language === 'ms' ? 'Pemberitahuan Emel' : 'Email Alerts'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {systemSettings.language === 'ms' ? 'Terima emel apabila ada peserta baharu mendaftar.' : 'Receive an email when a new participant registers.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={systemSettings.notifications} onChange={e => setSystemSettings({...systemSettings, notifications: e.target.checked})} />
                <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Moon size={20}/></div>
                {systemSettings.language === 'ms' ? 'Penampilan' : 'Appearance'}
             </h3>
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 gap-4">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {systemSettings.language === 'ms' ? 'Mod Gelap (Dark Mode)' : 'Dark Mode'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {systemSettings.language === 'ms' ? 'Tukar paparan kepada tema gelap untuk keselesaan mata.' : 'Switch the dashboard appearance to a darker theme.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={systemSettings.darkMode} onChange={e => setSystemSettings({...systemSettings, darkMode: e.target.checked})} />
                <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800 dark:peer-checked:bg-blue-500 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-800 dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden border border-transparent dark:border-slate-800">
              <div className="absolute -right-6 -top-6 text-slate-700/50 dark:text-slate-800/50 rotate-12"><Shield size={120}/></div>
              <Shield size={32} className="text-blue-400 mb-6 relative z-10"/>
              <h3 className="text-xl font-bold mb-2 relative z-10">
                {systemSettings.language === 'ms' ? 'Simpan Perubahan' : 'Save Changes'}
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-8 relative z-10">
                {systemSettings.language === 'ms' ? 'Pastikan anda menyimpan sebarang perubahan yang dilakukan.' : 'Make sure to save any changes applied to the settings.'}
              </p>
              <button 
                onClick={handleSaveSettings} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-900/50 dark:shadow-none relative z-10"
              >
                {systemSettings.language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    // WRAPPER MOD GELAP DI SINI
    <div className={`${systemSettings.darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
        
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in" onClick={() => setIsSidebarOpen(false)} />}

        <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-[#1e293b] text-slate-300 flex flex-col flex-shrink-0 h-full transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 text-white mb-1">
                <div className="bg-blue-600 p-1.5 rounded-lg"><LayoutDashboard size={20}/></div>
                <span className="font-bold text-lg tracking-wide">Admin Panel</span>
              </div>
              <p className="text-xs text-slate-500 ml-9">{systemSettings.language === 'ms' ? 'Pengurusan' : 'Management'}</p>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X size={24}/></button>
          </div>

          <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
            <div>
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {systemSettings.language === 'ms' ? 'Navigasi' : 'Navigation'}
              </p>
              <nav className="space-y-1">
                <button onClick={() => handleTabChange('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'text-blue-500' : ''}/> Dashboard
                </button>
                <button onClick={() => handleTabChange('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <Users size={18} className={activeTab === 'users' ? 'text-blue-500' : ''}/> {systemSettings.language === 'ms' ? 'Pengguna' : 'Users'}
                </button>
                <button onClick={() => handleTabChange('events')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'events' ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <Calendar size={18} className={activeTab === 'events' ? 'text-blue-500' : ''}/> {systemSettings.language === 'ms' ? 'Acara' : 'Events'}
                </button>
              </nav>
            </div>
            <div>
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {systemSettings.language === 'ms' ? 'Sistem' : 'System'}
              </p>
              <nav className="space-y-1">
                <button onClick={() => handleTabChange('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <Settings size={18} className={activeTab === 'settings' ? 'text-blue-500' : ''}/> {systemSettings.language === 'ms' ? 'Tetapan' : 'Settings'}
                </button>
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-slate-700/50">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-slate-400 hover:text-red-400 hover:bg-slate-800">
              <LogOut size={18}/> {systemSettings.language === 'ms' ? 'Log Keluar' : 'Logout'}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative" onClick={(e) => { if(!e.target.closest('td')) setActiveDropdown(null); }}>
          <header className="h-16 flex items-center justify-between md:justify-end px-4 md:px-8 bg-white dark:bg-slate-900 md:bg-transparent dark:md:bg-transparent border-b border-slate-200 dark:border-slate-800 md:border-none sticky top-0 z-30 transition-colors">
             <button className="md:hidden p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
               <Menu size={24} />
             </button>
             <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer ml-auto">A</div>
          </header>

          <div className="p-4 md:p-8 pt-4 md:pt-0 max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>

        {/* MODAL 1: EDIT/CREATE EVENT */}
        {isEventModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSaveEvent} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-transparent dark:border-slate-800">
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold dark:text-white">
                  {isEditingEvent 
                    ? (systemSettings.language === 'ms' ? 'Edit Acara' : 'Edit Event') 
                    : (systemSettings.language === 'ms' ? 'Cipta Acara Baharu' : 'Create New Event')}
                </h3>
                <button type="button" onClick={()=>setIsEventModalOpen(false)} className="text-slate-400 dark:hover:text-white"><X/></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <input required placeholder={systemSettings.language === 'ms' ? 'Tajuk Acara' : 'Event Title'} className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={eventForm.title} onChange={e=>setEventForm({...eventForm, title: e.target.value})} />
                <textarea required rows="3" placeholder={systemSettings.language === 'ms' ? 'Deskripsi' : 'Description'} className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={eventForm.description} onChange={e=>setEventForm({...eventForm, description: e.target.value})}></textarea>
                <div className="flex gap-4">
                  <input required type="date" className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm flex-1 bg-white dark:bg-slate-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" value={eventForm.date} onChange={e=>setEventForm({...eventForm, date: e.target.value})} />
                  <input required type="time" className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm flex-1 bg-white dark:bg-slate-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" value={eventForm.time} onChange={e=>setEventForm({...eventForm, time: e.target.value})} />
                </div>
                <input required placeholder={systemSettings.language === 'ms' ? 'Lokasi' : 'Location'} className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={eventForm.location} onChange={e=>setEventForm({...eventForm, location: e.target.value})} />
                <div className="flex gap-4">
                  <select className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm flex-1 bg-white dark:bg-slate-800 dark:text-white" value={eventForm.type} onChange={e=>setEventForm({...eventForm, type: e.target.value})}><option>Seminar</option><option>Workshop</option></select>
                  <input required type="number" placeholder={systemSettings.language === 'ms' ? 'Kapasiti' : 'Capacity'} className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm flex-1 bg-white dark:bg-slate-800 dark:text-white" value={eventForm.capacity} onChange={e=>setEventForm({...eventForm, capacity: e.target.value})} />
                </div>
                <select className="w-full p-2 border dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={eventForm.status} onChange={e=>setEventForm({...eventForm, status: e.target.value})}><option value="published">Published</option><option value="draft">Draft</option></select>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={()=>setIsEventModalOpen(false)} className="px-5 py-2 border dark:border-slate-700 rounded-lg text-sm dark:text-slate-300">
                  {systemSettings.language === 'ms' ? 'Batal' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">
                  {systemSettings.language === 'ms' ? 'Simpan' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL 2: QR CODE */}
        {qrModalEvent && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setQrModalEvent(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-8 text-center relative animate-in zoom-in-95 border border-transparent dark:border-slate-800" onClick={e=>e.stopPropagation()}>
              <button onClick={() => setQrModalEvent(null)} className="absolute top-4 right-4 text-slate-400 dark:hover:bg-slate-800 p-1 rounded-full"><X/></button>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 mt-2">
                {systemSettings.language === 'ms' ? 'QR Kehadiran' : 'Attendance QR'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">{qrModalEvent.title}</p>
              <div className="bg-white p-4 rounded-2xl border-4 border-blue-600 inline-block mb-6 shadow-xl shadow-blue-600/20 dark:shadow-none">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=HADIR-EVENT-${qrModalEvent.id}`} alt="QR Code" className="w-56 h-56 object-contain" />
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 py-2 px-4 rounded-lg">
                {systemSettings.language === 'ms' ? 'Sila imbas menggunakan telefon' : 'Please scan using your phone'}
              </p>
            </div>
          </div>
        )}

        {/* MODAL 3: BUTIRAN PENGGUNA */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-6 border border-transparent dark:border-slate-800">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold dark:text-white">{systemSettings.language === 'ms' ? 'Butiran Peserta' : 'Participant Details'}</h3>
                <button onClick={()=>setSelectedUser(null)}><X className="text-slate-400"/></button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">{selectedUser.full_name.charAt(0)}</div>
                <div><h4 className="font-bold text-lg dark:text-white">{selectedUser.full_name}</h4><p className="text-xs text-slate-500 dark:text-slate-400">ID: {selectedUser.p_id}</p></div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                  {systemSettings.language === 'ms' ? 'Rekod Acara Didaftar' : 'Registered Event Records'}
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {userEventHistory.length === 0 ? <p className="text-sm text-slate-400">{systemSettings.language === 'ms' ? 'Belum menyertai mana-mana acara.' : 'Not joined any events yet.'}</p> : 
                   userEventHistory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl">
                      <div><p className="text-sm font-bold text-slate-800 dark:text-white">{item.events.title}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{item.events.date}</p></div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.attended ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {item.attended 
                          ? (systemSettings.language === 'ms' ? 'HADIR' : 'ATTENDED') 
                          : (systemSettings.language === 'ms' ? 'DAFTAR' : 'REGISTERED')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: SENARAI PESERTA ACARA */}
        {selectedEventInfo && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-transparent dark:border-slate-800">
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{systemSettings.language === 'ms' ? 'Senarai Peserta' : 'Participant List'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedEventInfo.title}</p>
                </div>
                <button onClick={()=>setSelectedEventInfo(null)}><X className="text-slate-400"/></button>
              </div>
              <div className="p-6 overflow-y-auto">
                {eventParticipants.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">
                    {systemSettings.language === 'ms' ? 'Belum ada peserta yang mendaftar.' : 'No participants registered yet.'}
                  </p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase border-b dark:border-slate-800">
                        <th className="pb-3">{systemSettings.language === 'ms' ? 'Nama Peserta' : 'Participant Name'}</th>
                        <th className="pb-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {eventParticipants.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3"><p className="text-sm font-bold dark:text-white">{item.participants.full_name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.participants.email}</p></td>
                          <td className="py-3 text-center">
                            {item.attended 
                              ? <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded text-[10px] font-bold">{systemSettings.language === 'ms' ? 'HADIR' : 'ATTENDED'}</span> 
                              : <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-bold">{systemSettings.language === 'ms' ? 'TIDAK HADIR' : 'ABSENT'}</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;