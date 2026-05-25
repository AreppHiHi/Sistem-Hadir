import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const ScanQR = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [scanStatus, setScanStatus] = useState('scanning');
  const [message, setMessage] = useState('');

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
    if (!savedUser) navigate('/login');
    else setUser(JSON.parse(savedUser));
  }, [navigate]);

  useEffect(() => {
    if (!user || scanStatus !== 'scanning') return;

    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    }, false);

    const onScanSuccess = async (decodedText) => {
      scanner.clear(); 
      setScanStatus('loading');

      try {
        // PASTIKAN URL INI SAMA DENGAN BACKEND ANDA
        const response = await axios.post('https://hadir-backend.onrender.com/api/checkin', {
          p_id: user.p_id,
          qr_data: decodedText 
        });

        // Kemas kini status is_present di pelayar web
        const updatedUser = { ...user, is_present: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setScanStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setScanStatus('error');
        setMessage(error.response?.data?.error || (systemSettings.language === 'ms' ? "Gagal mengesahkan kehadiran." : "Failed to verify attendance."));
      }
    };

    scanner.render(onScanSuccess, (error) => {});
    
    return () => { 
      scanner.clear().catch(error => console.log("Kamera ditutup")); 
    };
  }, [user, scanStatus, systemSettings.language]);

  if (!user) return null;

  return (
    // PEMBUNGKUS MOD GELAP
    <div className={`${systemSettings.darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
        
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 transition-colors">
          
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 font-semibold transition-colors">
            <ArrowLeft size={20} className="mr-2" /> 
            {systemSettings.language === 'ms' ? 'Kembali' : 'Back'}
          </Link>
          
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 text-center">
            {systemSettings.language === 'ms' ? 'Imbas QR Kehadiran' : 'Scan Attendance QR'}
          </h2>

          {scanStatus === 'scanning' && (
            <div className="overflow-hidden rounded-2xl border-2 border-blue-200 dark:border-blue-800">
              {/* KOTAK RENDER KAMERA */}
              <div id="reader" className="w-full bg-black"></div>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4 pb-4 px-2">
                {systemSettings.language === 'ms' ? 'Halakan kamera pada QR Code Admin.' : 'Point the camera at the Admin\'s QR Code.'}
              </p>
            </div>
          )}

          {scanStatus === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300 font-bold">
                {systemSettings.language === 'ms' ? 'Mengesahkan data...' : 'Verifying data...'}
              </p>
            </div>
          )}

          {scanStatus === 'success' && (
            <div className="text-center py-8 animate-in zoom-in">
              <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {systemSettings.language === 'ms' ? 'Selesai!' : 'Success!'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8">{message}</p>
              <Link to="/dashboard" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors">
                {systemSettings.language === 'ms' ? 'Lihat Dashboard' : 'View Dashboard'}
              </Link>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="text-center py-8 animate-in zoom-in">
              <XCircle size={80} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {systemSettings.language === 'ms' ? 'Ralat' : 'Error'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8">{message}</p>
              <button 
                onClick={() => setScanStatus('scanning')} 
                className="bg-slate-800 dark:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 w-full mb-3 transition-colors"
              >
                {systemSettings.language === 'ms' ? 'Cuba Semula' : 'Try Again'}
              </button>
              <Link to="/dashboard" className="block text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-semibold mt-4 transition-colors">
                {systemSettings.language === 'ms' ? 'Kembali ke Dashboard' : 'Back to Dashboard'}
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ScanQR;