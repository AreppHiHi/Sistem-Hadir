import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  LogIn, 
  Fingerprint, 
  CheckSquare, 
  Users, 
  Settings 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col font-sans">
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-16">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-8 border border-blue-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="text-sm font-semibold tracking-wide uppercase">Workshop Registration Open</span>
        </div>

        {/* Brand Name */}
        <h1 className="text-7xl font-black text-center text-blue-600 italic mb-2">
          HADIR
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 font-medium text-center mb-4">
          Smart Workshop Registration & Attendance
        </p>

        <p className="text-slate-500 text-center max-w-xl mb-12 text-lg leading-relaxed">
          Register in seconds, get your unique Hadir ID, and enjoy seamless check-in on event day. No passwords to remember.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-full sm:w-auto text-lg"
          >
            <UserPlus size={22} />
            Register Now
          </Link>
          
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm w-full sm:w-auto text-lg"
          >
            <LogIn size={22} />
            Participant Login
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-24">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Fingerprint size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Unique Hadir ID</h3>
            <p className="text-slate-500">Get a 4-digit ID for quick, hassle-free access.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <CheckSquare size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Check-in</h3>
            <p className="text-slate-500">One-click attendance marking on event day.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Tracking</h3>
            <p className="text-slate-500">Live dashboard for organizers with full participant data.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-8 py-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 mt-12 text-sm text-slate-500">
        <p className="font-medium">© 2026 HADIR</p>
        <button className="inline-flex items-center gap-2 hover:text-blue-600 transition-colors mt-4 sm:mt-0 font-semibold">
          <Settings size={18} />
          Admin Panel
        </button>
      </footer>
      
    </div>
  );
};

export default LandingPage;