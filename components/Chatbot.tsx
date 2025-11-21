
import React, { useState, useEffect } from 'react';

export default function Chatbot() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Trigger popup every 60 seconds (1 minute)
    const timer = setInterval(() => {
      setShowPopup(true);
      // Auto hide popup after 10 seconds if not clicked, to be non-intrusive
      setTimeout(() => setShowPopup(false), 10000);
    }, 60000);

    // Show initially after 3 seconds
    const initialTimer = setTimeout(() => setShowPopup(true), 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, []);

  const handleSupportClick = () => {
    window.open('https://wa.me/message/5UCID7PTIPHLE1', '_blank');
    setShowPopup(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popup Notification */}
      <div 
        className={`mb-4 bg-white text-gray-900 p-4 rounded-2xl shadow-2xl border border-blue-100 max-w-xs transition-all duration-500 transform origin-bottom-right flex items-start gap-3 cursor-pointer hover:scale-105 ${
          showPopup ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
        onClick={handleSupportClick}
      >
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
             <SupportIcon />
        </div>
        <div>
            <h4 className="font-bold text-sm text-blue-900">Support Team</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Need help with your shipment? <br/>
                <span className="text-green-600 font-semibold">Click here to chat on WhatsApp!</span>
            </p>
        </div>
        <button 
            onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
            <CloseIcon />
        </button>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleSupportClick}
        className="group relative flex items-center justify-center w-16 h-16 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-400/50"
        aria-label="Contact Support"
      >
        <WhatsAppIcon />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
        </span>
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

function SupportIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
}

function CloseIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
