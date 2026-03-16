import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, Map as MapIcon, List, LogOut, TrendingUp, Filter, MapPin } from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function AuthorityDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'list', 'map'
  const [showHotspots, setShowHotspots] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/reports');
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/reports/${id}/resolve`);
      fetchReports();
    } catch (err) {
      alert("Failed to resolve report");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalHazards = reports.length;
  const unresolvedHazards = reports.filter(r => r.status === 'reported').length;
  const totalCost = reports.reduce((acc, curr) => curr.status === 'reported' ? acc + curr.estimated_cost : acc, 0);

  const getSeverityColor = (severity) => {
    if (severity === 'Severe') return 'text-red-400 bg-red-950/50 border border-red-800';
    if (severity === 'Medium') return 'text-orange-400 bg-orange-950/50 border border-orange-800';
    return 'text-emerald-400 bg-emerald-950/50 border border-emerald-800';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'Severe') return <AlertOctagon size={16} />;
    if (severity === 'Medium') return <AlertTriangle size={16} />;
    return <Info size={16} />;
  };

  // Chart Data preparation
  const severityCounts = { Severe: 0, Medium: 0, Low: 0 };
  reports.forEach(r => {
      if (severityCounts[r.severity_label] !== undefined) {
          severityCounts[r.severity_label]++;
      }
  });
  
  const barChartData = [
      { name: 'Severe', hazards: severityCounts.Severe, color: '#ef4444' }, // red-500
      { name: 'Medium', hazards: severityCounts.Medium, color: '#f97316' }, // orange-500
      { name: 'Low', hazards: severityCounts.Low, color: '#10b981' }       // emerald-500
  ];

  const pieChartData = [
      { name: 'Unresolved', value: unresolvedHazards, color: '#ef4444' },
      { name: 'Resolved', value: totalHazards - unresolvedHazards, color: '#10b981' }
  ];

  if (loading) return <div className="text-center mt-20 text-gray-400">Initializing Core Systems...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 -m-4 md:-m-8 p-4 md:p-8 font-sans">
      {/* Premium Dark Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800/60 backdrop-blur-sm sticky top-0 z-10 pt-4">
        <div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
                Command Center
            </h2>
            <p className="text-slate-400 text-sm mt-1">Real-time infrastructure monitoring</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">
            <div className="bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 flex shadow-inner">
                <button 
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'dashboard' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                <TrendingUp size={16}/> Overview
                </button>
                <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                <MapIcon size={16}/> Map
                </button>
                <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                <List size={16}/> Log
                </button>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-800/80 text-red-400 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 hover:border-red-900/50 transition-all shadow-sm"
            >
              <LogOut size={16} /> Logout
            </button>
        </div>
      </div>

      {viewMode === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Neon KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={64} className="text-blue-500"/>
                    </div>
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Total Reported Logs</p>
                    <p className="text-4xl font-black text-slate-100">{totalHazards}</p>
                </div>
                
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={64} className="text-orange-500"/>
                    </div>
                    <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Active Hazards</p>
                    <p className="text-4xl font-black text-slate-100">{unresolvedHazards}</p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MapIcon size={64} className="text-red-500"/>
                    </div>
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Projected Repair Cost</p>
                    <p className="text-4xl font-black text-slate-100">₹{totalCost.toLocaleString()}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <Filter className="text-indigo-400" size={18}/> Severity Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false}/>
                                <Tooltip 
                                    cursor={{fill: '#334155'}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                />
                                <Bar dataKey="hazards" radius={[4, 4, 0, 0]}>
                                    {barChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <CheckCircle className="text-indigo-400" size={18}/> Resolution Status
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={pieChartData} 
                                    cx="50%" 
                                    cy="45%" 
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}/>
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>
      )}

      {viewMode === 'map' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4 flex justify-end">
                <label className="flex items-center cursor-pointer gap-2 bg-slate-800/60 px-4 py-2 rounded-full border border-slate-700/50 hover:bg-slate-700/60 transition-colors">
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={showHotspots} onChange={() => setShowHotspots(!showHotspots)} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${showHotspots ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showHotspots ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-medium text-slate-300">Show Predictive Risk Zones</span>
                </label>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden h-[600px] border border-slate-700/50 relative z-0">
                {reports.length > 0 ? (
                    <MapContainer 
                        center={[reports[0]?.gps_lat || 20.5937, reports[0]?.gps_long || 78.9629]} 
                        zoom={10} 
                        style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
                    >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    
                    {/* Render standard markers */}
                    {reports.map((report) => (
                        <Marker key={`marker-${report.id}`} position={[report.gps_lat, report.gps_long]}>
                        <Popup className="premium-popup">
                            <div className="text-sm p-1">
                            <p className="font-bold mb-1 capitalize text-slate-800">{report.hazard_type}</p>
                            <p className={`inline-block px-2 py-1 rounded text-xs mb-2 ${
                                report.severity_label === 'Severe' ? 'text-red-700 bg-red-100' :
                                report.severity_label === 'Medium' ? 'text-orange-700 bg-orange-100' :
                                'text-emerald-700 bg-emerald-100'
                            }`}>
                                {report.severity_label}
                            </p>
                            <img src={`http://localhost:8000${report.image_path}`} alt="Hazard" className="w-full h-32 object-cover rounded-md mt-1 mb-3 shadow-inner" />
                            <p className="mb-3 text-slate-600"><strong>Est. Cost:</strong> ₹{report.estimated_cost}</p>
                            {report.status === 'reported' ? (
                                <button 
                                onClick={() => handleResolve(report.id)}
                                className="bg-indigo-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-indigo-700 w-full shadow-sm transition-colors"
                                >
                                Mark as Resolved
                                </button>
                            ) : (
                                <span className="text-emerald-600 font-bold flex items-center justify-center gap-1 text-xs bg-emerald-50 py-2 rounded">
                                <CheckCircle size={14}/> Resolved
                                </span>
                            )}
                            </div>
                        </Popup>
                        </Marker>
                    ))}

                    {/* Render predictive risk hotspots if enabled */}
                    {showHotspots && reports.map((report) => {
                        // Creating an artificial "risk zone" around severe hazards
                        if (report.severity_label === 'Severe' && report.status === 'reported') {
                            return (
                                <Circle 
                                    key={`hotspot-${report.id}`}
                                    center={[report.gps_lat, report.gps_long]}
                                    pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.2, weight: 1 }}
                                    radius={800} // 800 meter radius risk zone
                                >
                                    <Popup>High Risk Zone: Road degradation likely to spread.</Popup>
                                </Circle>
                            )
                        }
                        return null;
                    })}
                    </MapContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 font-medium">Awaiting Telemetry Data...</div>
                )}
            </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Telemetry Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Coordinates</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {reports.map((report) => (
                  <tr key={report.id} className={`transition-colors hover:bg-slate-800/60 ${report.status === 'resolved' ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24">
                          <img className="h-16 w-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition shadow-md border border-slate-700" src={`http://localhost:8000${report.image_path}`} alt="" 
                               onClick={() => window.open(`http://localhost:8000${report.image_path}`, '_blank')} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-200 capitalize">{report.hazard_type}</div>
                          <div className="text-xs text-slate-500 mt-1">
                             {/* FIX: Parse as UTC to prevent timezone offset bugs, then format to local string */}
                             {moment.utc(report.date_reported).local().fromNow()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300 flex items-center gap-1.5 font-mono">
                          <MapPin size={14} className="text-indigo-400"/> {report.gps_lat.toFixed(4)}, {report.gps_long.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md items-center gap-1.5 shadow-sm ${getSeverityColor(report.severity_label)}`}>
                        {getSeverityIcon(report.severity_label)} {report.severity_label}
                      </span>
                      <div className="text-sm text-slate-300 mt-2 font-mono flex items-center gap-1">
                        <span className="text-slate-500">EST:</span> ₹{report.estimated_cost.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.status === 'reported' ? (
                         <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending Repair</span>
                      ) : (
                         <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {report.status === 'reported' ? (
                        <button 
                            onClick={() => handleResolve(report.id)}
                            className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 ml-auto justify-center min-w-[120px]"
                        >
                            <CheckCircle size={16} /> Resolve
                        </button>
                      ) : (
                        <span className="text-slate-500 font-bold tracking-wider text-xs">ARCHIVED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
