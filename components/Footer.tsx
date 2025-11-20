
import React, { useState } from 'react';

export default function Footer() {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Zahid17181277') {
      alert('Access Granted! Welcome back, Admin.');
      // Reset state after successful login simulation
      setShowLogin(false);
      setPassword('');
      setError(false);
      // In a real app, redirect here
    } else {
      setError(true);
      // Shake effect or error state
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <footer>
        <div className="footer-content">
            <div className="footer-brand">
                <h2>Zahid Cargo</h2>
            </div>
            <p className="footer-text">
                © {new Date().getFullYear()} Zahid Cargo. Premium global shipping services for your precious parcels.
            </p>
            
            {showLogin ? (
                <form onSubmit={handleLogin} className="flex flex-col items-center gap-3 mt-2 animate-[fadeIn_0.3s_ease-out]">
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            placeholder="Enter Admin Password"
                            className={`px-4 py-2 rounded-lg bg-gray-900/80 border-2 ${error ? 'border-red-500 text-red-200' : 'border-purple-500/50 text-white'} focus:outline-none focus:border-purple-500 transition-all w-64 text-center placeholder-gray-500 font-mono text-sm shadow-lg`}
                            autoFocus
                        />
                        {error && <span className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-400 font-bold">Incorrect Password</span>}
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-purple-500/25 active:scale-95"
                        >
                            Login
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                setShowLogin(false);
                                setPassword('');
                                setError(false);
                            }}
                            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-semibold text-sm transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button className="admin-button" onClick={() => setShowLogin(true)}>
                    <span>Admin Team Access</span>
                </button>
            )}
        </div>
    </footer>
  );
}
