import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const ScanQR = () => {
  const navigate = useNavigate();
  
  // MENGAMBIL ID ACARA DARI DASHBOARD
  const [searchParams] = useSearchParams();
  const expectedEventId = searchParams.get('event');

  const [user, setUser] = useState(null);
  const [scanStatus, setScanStatus] = useState('scanning');
  const [message, setMessage] = useState('');

  // --- STATE TETAPAN (LANGUAGE & DARK MODE) ---
  const [systemSettings, setSystemSettings] = useState({
    language: 'ms',
    darkMode: false
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSystemSettings(JSON.parse(savedSettings));
    }

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

      // ==========================================
      // VALIDASI: HALANG PENGGUNA IMBAS QR ACARA LAIN
      // ==========================================
      if (expectedEventId && decodedText !== `HADIR-EVENT-${expectedEventId}`) {
        setScanStatus('error');
        setMessage(systemSettings.language === 'ms' 
          ? "Gagal: Ini adalah QR Code bagi acara lain. Sila imbas QR Code yang betul untuk acara ini." 
          : "Failed: This QR Code is for a different event. Please scan the correct one.");
        return; // Berhenti di sini, jangan hantar ke backend
      }

      try {
        const response = await axios.post('https://hadir-backend.onrender.com/api/checkin', {
          p_id: user.p_id,
          qr_data: decodedText 
        });

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
  }, [user, scanStatus, systemSettings.language, expectedEventId]);

  if (!user) return null;

  return (
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

          {/* ========================================== */}
          {/* PAPARAN MENGIMBAS (SCANNING)               */}
          {/* ========================================== */}
          {scanStatus === 'scanning' && (
            <div className="overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800">
              
              <style dangerouslySetInnerHTML={{__html: `
                #reader { border: none !important; padding: 1rem; }
                #reader button {
                  background-color: #2563eb !important;
                  color: white !important;
                  padding: 10px 20px !important;
                  border-radius: 8px !important;
                  font-weight: bold !important;
                  border: none !important;
                  margin: 10px 5px !important;
                  cursor: pointer;
                  transition: all 0.2s;
                }
                #reader button:hover { background-color: #1d4ed8 !important; }
                #reader select {
                  padding: 10px !important;
                  border-radius: 8px !important;
                  border: 1px solid #cbd5e1 !important;
                  margin-bottom: 15px !important;
                  width: 100% !important;
                  max-width: 300px !important;
                  background-color: white !important;
                  color: #0f172a !important;
                  font-weight: 600 !important;
                }
                .dark #reader select {
                  background-color: #1e293b !important;
                  color: white !important;
                  border-color: #334155 !important;
                }
                #reader__dashboard_section_csr span {
                  color: inherit !important;
                  font-weight: 500 !important;
                }
                #reader__dashboard_section_swaplink { text-decoration: none !important; color: #2563eb !important; font-weight: bold !important; }
              `}} />

              <div id="reader" className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"></div>
              
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4 pb-4 px-2">
                {systemSettings.language === 'ms' ? 'Pilih kamera dan halakan pada QR Code Admin.' : 'Select a camera and point it at the Admin\'s QR Code.'}
              </p>
            </div>
          )}

          {/* ========================================== */}
          {/* PAPARAN MEMUAT (LOADING)                   */}
          {/* ========================================== */}
          {scanStatus === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300 font-bold">
                {systemSettings.language === 'ms' ? 'Mengesahkan data...' : 'Verifying data...'}
              </p>
            </div>
          )}

          {/* ========================================== */}
          {/* PAPARAN BERJAYA (SUCCESS)                  */}
          {/* ========================================== */}
          {scanStatus === 'success' && (
            <div className="text-center py-8 animate-in zoom-in">
              <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {systemSettings.language === 'ms' ? 'Selesai!' : 'Success!'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8">{message}</p>
              <Link to="/dashboard" className="inline-block w-full bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-md">
                {systemSettings.language === 'ms' ? 'Lihat Dashboard' : 'View Dashboard'}
              </Link>
            </div>
          )}

          {/* ========================================== */}
          {/* PAPARAN GAGAL/RALAT (ERROR)                */}
          {/* ========================================== */}
          {scanStatus === 'error' && (
            <div className="text-center py-8 animate-in zoom-in">
              <XCircle size={80} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {systemSettings.language === 'ms' ? 'Gagal Mendaftar!' : 'Registration Failed!'}
              </h3>
              <p className="text-red-600 dark:text-red-400 font-semibold mb-8 px-4">{message}</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setScanStatus('scanning')} 
                  className="inline-block w-full bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 dark:hover:bg-red-500 transition-colors shadow-md"
                >
                  {systemSettings.language === 'ms' ? 'Cuba Imbas Semula' : 'Try Scanning Again'}
                </button>
                <Link to="/dashboard" className="inline-block w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  {systemSettings.language === 'ms' ? 'Kembali ke Dashboard' : 'Back to Dashboard'}
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ScanQR;