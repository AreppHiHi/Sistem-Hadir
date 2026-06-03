import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'; // Tambah Eye & EyeOff

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // State kawalan borang
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // --- TAMBAHAN BARU: State untuk Sahkan Password & Fungsi Mata ---
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State status
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fungsi Langkah 1: Minta OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage({ type: '', text: '' });
    
    try {
      const res = await axios.post('https://hadir-backend.onrender.com/api/forgot-password/', { email });
      setMessage({ type: 'success', text: res.data.message });
      setStep(2); 
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Gagal menghantar OTP." });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Langkah 2: Sahkan OTP dan tukar password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // --- TAMBAHAN BARU: Semak jika kata laluan sama ---
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Kata laluan baharu tidak sepadan. Sila semak semula.' });
      return; // Berhenti proses jika tak sama
    }

    setLoading(true); setMessage({ type: '', text: '' });

    try {
      const res = await axios.post('https://hadir-backend.onrender.com/api/forgot-password/reset', { 
        email, 
        otp, 
        newPassword 
      });
      alert(res.data.message);
      navigate('/login'); 
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Kod OTP tidak sah." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 p-8 md:p-10 relative">
        
        {/* Butang Kembali (Back) */}
        <Link to="/login" className="absolute top-6 left-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Lupa Kata Laluan?</h2>
          <p className="text-slate-500 text-sm mt-2">
            {step === 1 ? "Masukkan emel anda dan kami akan hantar kod pengesahan." : "Sila semak emel anda dan masukkan kod OTP 6-digit."}
          </p>
        </div>

        {/* Paparan Mesej Ralat/Kejayaan */}
        {message.text && (
          <div className={`p-3 rounded-xl text-sm font-bold mb-6 text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* BENTUK BORANG MENGIKUT LANGKAH (STEP) */}
        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required type="email" placeholder="Alamat Emel Berdaftar" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" 
                value={email} onChange={e=>setEmail(e.target.value)} 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-slate-900 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-slate-200">
              {loading ? 'Menghantar Emel...' : <>Dapatkan Kod OTP <ArrowRight size={18}/></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            
            {/* KOD OTP */}
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required type="text" maxLength="6" placeholder="Kod OTP 6-Digit" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all tracking-[0.5em] font-bold text-center" 
                value={otp} onChange={e=>setOtp(e.target.value)} 
              />
            </div>

            {/* KATA LALUAN BAHARU + MATA */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required 
                type={showNewPassword ? "text" : "password"} 
                placeholder="Kata Laluan Baharu" 
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" 
                value={newPassword} onChange={e=>setNewPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none p-1"
                title={showNewPassword ? "Sembunyikan" : "Papar"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* SAHKAN KATA LALUAN BAHARU + MATA */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Sahkan Kata Laluan Baharu" 
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" 
                value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none p-1"
                title={showConfirmPassword ? "Sembunyikan" : "Papar"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-blue-200">
              {loading ? 'Memproses...' : 'Tukar Kata Laluan'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;