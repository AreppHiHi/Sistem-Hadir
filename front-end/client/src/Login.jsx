import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '', 
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // --- TAMBAHAN BARU: State untuk kawal paparan kata laluan ---
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');

    try {
      const res = await axios.post('http://10.1.30.147:5000/api/login', formData);
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.role === 'admin' || res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.error || "Gagal log masuk. Pastikan server berfungsi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 p-8 md:p-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-600 italic tracking-tight mb-2">HADIR</h1>
          <h2 className="text-xl font-bold text-slate-800">Log Masuk</h2>
          <p className="text-slate-500 text-sm mt-1">Masukkan ID/Emel dan Kata Laluan anda.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-6 text-center animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* IDENTIFIER INPUT */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required 
              type="text" 
              placeholder="Emel / ID Peserta / Username Admin" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" 
              value={formData.identifier} 
              onChange={e => setFormData({...formData, identifier: e.target.value})} 
            />
          </div>

          {/* PASSWORD INPUT DENGAN FUNGSI MATA (EYE) */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required 
              // Jenis input berubah bergantung pada state showPassword
              type={showPassword ? "text" : "password"} 
              placeholder="Kata Laluan" 
              // Ditambah pr-12 supaya tulisan password tidak bertindih dengan ikon mata
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm transition-all" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
            {/* Butang Toggle Mata */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none p-1"
              title={showPassword ? "Sembunyikan Kata Laluan" : "Papar Kata Laluan"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-blue-600 font-medium hover:underline text-sm transition-all">
              Lupa Kata Laluan?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-2 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-blue-200"
          >
            {loading ? 'Memproses...' : <>Log Masuk <ArrowRight size={18}/></>}
          </button>

        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Belum mempunyai akaun? <Link to="/register" className="text-blue-600 font-bold hover:underline transition-all">Daftar Sekarang</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;