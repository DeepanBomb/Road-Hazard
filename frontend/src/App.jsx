import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import CitizenReport from './components/CitizenReport';
import AuthorityDashboard from './components/AuthorityDashboard';
import Login from './components/Login';
import { Activity } from 'lucide-react';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-200 p-3 sm:p-4 sticky top-0 z-50">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/20 p-1.5 sm:p-2 rounded-lg border border-indigo-500/30">
                <Activity className="text-indigo-400" size={20} />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">RoadSentinel</h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-4 shrink-0 w-full sm:w-auto justify-center">
              <Link to="/" className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors flex-1 sm:flex-none text-center bg-slate-800/50 sm:bg-transparent border border-slate-700/50 sm:border-transparent">Submit Report</Link>
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors flex-1 sm:flex-none text-center bg-slate-800/50 sm:bg-transparent border border-slate-700/50 sm:border-transparent">Authority Portal</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<CitizenReport />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AuthorityDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
