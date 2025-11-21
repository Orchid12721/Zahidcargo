
import React, { useState } from 'react';

interface FooterProps {
    onLogin?: () => void;
}

export default function Footer({ onLogin }: FooterProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Zahid17181277') {
      if (onLogin) {
        onLogin();
      } else {
        alert('Access Granted! Welcome back, Admin.');
      }
      // Reset state after successful login
      setShowLogin(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <footer>
        <div className="footer-content">
            <div className="footer-brand">
                <h2>Orchid Malaysia</h2>
            </div>
            <p className="footer-text">
                © {new Date().getFullYear()} Orchid Malaysia. Premium global shipping services for your precious parcels.
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
                            className={`px-4 py-2 rounded-lg bg-gray-900/80 border-2 ${error ? 'border-red-500 text-red-200' : 'border-blue-500/50 text-white'} focus:outline-none focus:border-blue-500 transition-all w-64 text-center placeholder-gray-500 font-mono text-sm shadow-lg`}
                            autoFocus
                        />
                        {error && <span className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-400 font-bold">Incorrect Password</span>}
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-blue-500/25 active:scale-95"
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
