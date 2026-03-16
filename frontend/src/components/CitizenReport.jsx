import { useState } from 'react';
import axios from 'axios';
import { Camera, MapPin, UploadCloud, AlertCircle, ShieldAlert } from 'lucide-react';

export default function CitizenReport() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setError(null);
        },
        (err) => {
          let errorMsg = "Could not fetch location. Please enable GPS.";
          if (err.code === 1) errorMsg = "Location access denied. Please allow location permissions in your browser.";
          else if (err.code === 2) errorMsg = "Location unavailable. Please make sure your device's location services are turned on.";
          else if (err.code === 3) errorMsg = "Location request timed out.";
          setError(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !location.lat) {
      setError("Please provide both an image and your location.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);
    formData.append('gps_lat', location.lat);
    formData.append('gps_long', location.lng);

    try {
      const response = await axios.post('http://localhost:8000/api/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred while submitting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-indigo-500/20 p-3 rounded-full border border-indigo-500/30">
                <ShieldAlert className="text-indigo-400 w-8 h-8"/>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Report Hazard</h2>
        </div>
        
        {error && (
          <div className="bg-red-950/50 border border-red-900/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 shadow-inner">
            <AlertCircle size={20} className="shrink-0" /> 
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {result ? (
          <div className="bg-emerald-950/30 border border-emerald-900/50 p-6 rounded-2xl text-center shadow-inner animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Report Submitted!</h3>
            <p className="text-slate-400 text-sm mb-6">Your data is helping make roads safer.</p>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 text-left space-y-3 mb-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Detection</span>
                  <span className="text-slate-200 capitalize font-medium">{result.hazard_type}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Severity</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold shadow-sm ${result.severity_label === 'Severe' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      result.severity_label === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                    {result.severity_label}
                  </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Est. Cost</span>
                  <span className="text-slate-200 font-mono">₹{result.estimated_cost.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setImage(null); setPreview(null); }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 px-4 rounded-xl font-bold border border-slate-600 shadow-md transition-all flex justify-center focus:ring-2 focus:ring-slate-500 focus:outline-none"
            >
              Report Another Hazard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Capture */}
            <div className="space-y-2 group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Location Data</label>
              <button
                  type="button"
                  onClick={getLocation}
                  className="w-full flex justify-between items-center bg-slate-900/50 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none group-hove:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                        <MapPin size={18} className="text-blue-400" />
                    </div>
                    <span className={`text-sm font-medium ${location.lat ? 'text-slate-200 font-mono' : 'text-slate-400'}`}>
                        {location.lat ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Acquire GPS Coordinates"}
                    </span>
                  </div>
                  {location.lat && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold tracking-wider">LOCKED</span>}
                </button>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Visual Evidence</label>
              <div className="relative group">
                <input id="file-upload" name="file-upload" type="file" accept="image/*" capture="environment" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                
                <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all ${preview ? 'border-slate-600 bg-slate-900/80 p-2' : 'border-slate-600 bg-slate-900/30 group-hover:bg-slate-800/50 group-hover:border-indigo-500/50'}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded-lg shadow-inner" />
                  ) : (
                    <>
                        <div className="bg-slate-800 p-4 rounded-full mb-3 shadow-inner border border-slate-700">
                             <Camera className="h-8 w-8 text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Tap to Open Camera</span>
                        <span className="text-xs text-slate-500 mt-1">Real-time captures only</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
                <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden flex justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all border border-indigo-400"
                >
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-white/20 h-1/2"></div>
                
                <div className="relative z-10 flex items-center">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <UploadCloud className="animate-bounce" size={18} /> Transmitting & Analyzing...
                        </span>
                    ) : "Submit Telemetry"}
                </div>
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
