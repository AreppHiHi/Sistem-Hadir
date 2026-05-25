import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, Lock, Building, ArrowRight, Eye, EyeOff, CheckCircle, Copy } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  // State untuk kawalan borang
  const [formData, setFormData] = useState({
    full_name: '', 
    email: '', 
    phone: '', 
    koperasi: '', 
    nama_ringkas_koperasi: '', // <-- TAMBAHAN BARU
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk Papar/Sembunyi Password
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Modal Kejayaan
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    
    try {
      const res = await axios.post('https://hadir-backend.onrender.com/api/register', formData);
      
      // Jika berjaya, tangkap ID yang dijana oleh backend
      const newUserId = res.data.data.p_id; 
      setRegisteredUserId(newUserId);
      
      // Buka pop-up kejayaan (jangan terus navigate)
      setShowSuccessModal(true);

    } catch (err) {
      setError(err.response?.data?.error || "Pendaftaran gagal.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registeredUserId);
    alert("ID Pengguna disalin: " + registeredUserId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans relative">
      
      {/* KOTAK BORANG PENDAFTARAN UTAMA */}
      <div className={`w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 p-8 md:p-10 transition-all duration-300 ${showSuccessModal ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-600 italic tracking-tight mb-2">HADIR</h1>
          <h2 className="text-xl font-bold text-slate-800">Daftar Akaun Baru</h2>
          <p className="text-slate-500 text-sm mt-1">Lengkapkan maklumat di bawah untuk menyertai acara.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-6 text-center animate-in fade-in">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input required type="text" placeholder="Nama Penuh" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input required type="email" placeholder="Alamat Emel" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input required type="text" placeholder="No. Telefon" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
          </div>
          
          {/* INPUT KOPERASI PENUH */}
          <div className="relative">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input required type="text" placeholder="Nama Koperasi / Organisasi" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" value={formData.koperasi} onChange={e=>setFormData({...formData, koperasi: e.target.value})} />
          </div>

          {/* TAMBAHAN BARU: INPUT NAMA RINGKAS KOPERASI */}
          <div className="relative">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input required type="text" placeholder="Nama Ringkas Koperasi (Cth: KOPMAS)" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" value={formData.nama_ringkas_koperasi} onChange={e=>setFormData({...formData, nama_ringkas_koperasi: e.target.value})} />
          </div>

          {/* PASSWORD DENGAN FUNGSI MATA */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required 
              type={showPassword ? "text" : "password"} 
              placeholder="Kata Laluan" 
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" 
              value={formData.password} 
              onChange={e=>setFormData({...formData, password: e.target.value})} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none p-1"
              title={showPassword ? "Sembunyikan Kata Laluan" : "Papar Kata Laluan"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-blue-200">
            {loading ? 'Memproses...' : <>Daftar Sekarang <ArrowRight size={18}/></>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Sudah mempunyai akaun? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log Masuk</Link>
        </p>
      </div>

      {/* ============================================== */}
      {/* MODAL KEJAYAAN (MUNCUL SELEPAS BERJAYA DAFTAR) */}
      {/* ============================================== */}
      {showSuccessModal && (
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 md:p-10 text-center animate-in zoom-in-95 duration-300">
          
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle size={48} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-2">Pendaftaran Berjaya!</h2>
          <p className="text-slate-500 text-sm mb-8 px-2">
            Akaun anda telah didaftarkan. <strong className="text-slate-700">Sila simpan ID Pengguna anda di bawah</strong> kerana ia diperlukan untuk log masuk.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ID PENGGUNA ANDA</p>
            <h1 className="text-5xl font-black text-blue-600 tracking-widest">{registeredUserId}</h1>
            
            <button 
              onClick={copyToClipboard}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Salin ID"
            >
              <Copy size={20} />
            </button>
          </div>

          <button 
            onClick={() => navigate('/login')} 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            Log Masuk Sekarang
          </button>
        </div>
      )}

    </div>
  );
};

export default Register;