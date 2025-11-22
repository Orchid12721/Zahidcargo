
import React, { useState } from 'react';

interface FooterProps {
    onLogin?: () => void;
}

export default function Footer({ onLogin }: FooterProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
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
      setShowLoginModal(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <>
      <footer className="relative">
          <div className="footer-content">
              <div className="footer-brand">
                  <h2>Orchid Malaysia</h2>
              </div>
              <p className="footer-text">
                  © {new Date().getFullYear()} Orchid Malaysia. Premium global shipping services for your precious parcels.
              </p>
          </div>

          {/* Discreet Admin Access Button (Absolute Bottom Left of Footer) */}
          {/* Positioned absolutely within the relative footer, so it stays at the bottom of the page */}
          <button 
              onClick={() => setShowLoginModal(true)}
              className="absolute bottom-4 left-4 z-10 p-3 text-white/10 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
              title="Admin Access"
              aria-label="Admin Login"
          >
              <LockIcon />
          </button>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
              <div 
                  className="bg-gray-900 border border-blue-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-blue-900/20 relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
              >
                   {/* Close Button */}
                   <button 
                      onClick={() => setShowLoginModal(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>

                   <div className="text-center mb-6">
                       <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-400">
                           <LockIconLarge />
                       </div>
                       <h3 className="text-xl font-bold text-white">Admin Verification</h3>
                       <p className="text-sm text-gray-400">Enter secure password to continue</p>
                   </div>

                   <form onSubmit={handleLogin} className="space-y-4">
                      <div className="relative">
                          <input 
                              type="password" 
                              value={password}
                              onChange={(e) => {
                                  setPassword(e.target.value);
                                  setError(false);
                              }}
                              placeholder="Password"
                              className={`w-full px-4 py-3 rounded-xl bg-black/50 border-2 ${error ? 'border-red-500 text-red-200' : 'border-blue-500/30 text-white'} focus:outline-none focus:border-blue-500 transition-all text-center placeholder-gray-600 font-mono tracking-widest shadow-inner`}
                              autoFocus
                          />
                      </div>
                      
                      {error && (
                          <p className="text-xs text-red-400 font-bold text-center animate-pulse">
                              Access Denied: Incorrect Password
                          </p>
                      )}

                      <button 
                          type="submit" 
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                      >
                          Access Dashboard
                      </button>
                   </form>
              </div>
          </div>
      )}
    </>
  );
}

function LockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    );
}

function LockIconLarge() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            <path d="M12 15v2"></path>
            <circle cx="12" cy="16" r="1"></circle>
        </svg>
    );
}
