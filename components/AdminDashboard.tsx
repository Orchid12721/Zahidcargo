
import React, { useState, useEffect, useRef } from 'react';
import type { TrackingData, TrackingEvent } from '../types';

interface AdminDashboardProps {
  shipments: { [key: string]: TrackingData };
  onCreateShipment: (data: TrackingData) => void;
  onUpdateShipment: (trackingNumber: string, event: TrackingEvent) => void;
  onDeleteShipment: (trackingNumber: string) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ shipments, onCreateShipment, onUpdateShipment, onDeleteShipment, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'update'>('create');
  
  // Create Shipment State
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [estDelivery, setEstDelivery] = useState(''); // YYYY-MM-DD from date input
  
  // New fields for details
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [pieceCount, setPieceCount] = useState('');
  const [shipmentType, setShipmentType] = useState('Parcel');
  
  // Validation State
  const [createError, setCreateError] = useState<string | null>(null);

  const [generatedId, setGeneratedId] = useState<string | null>(null);

  // Update Shipment State
  const [selectedId, setSelectedId] = useState('');
  const [newStatus, setNewStatus] = useState('In Transit');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'status' | 'origin' | 'destination'>('id');
  const [filterType, setFilterType] = useState<string>('all');

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Real-time visual feedback state
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // Ref to track previous shipments for diffing
  const prevShipmentsRef = useRef(shipments);

  // Watch for updates to shipments prop (triggered by Supabase Realtime in App.tsx)
  useEffect(() => {
    const prev = prevShipmentsRef.current;
    const curr = shipments;
    const prevKeys = Object.keys(prev);
    const currKeys = Object.keys(curr);

    // Check for new shipments
    const newKeys = currKeys.filter(k => !prevKeys.includes(k));
    if (newKeys.length > 0) {
        setNotification({ message: `New Shipment Received: ${newKeys.join(', ')}`, type: 'success' });
        setRecentlyUpdatedId(newKeys[0]); // Highlight the first new one
    }

    // Check for status updates
    // We check if a key exists in both but status changed
    const changedKey = currKeys.find(k => prevKeys.includes(k) && prev[k].currentStatus !== curr[k].currentStatus);
    if (changedKey) {
         setNotification({ message: `Update: ${changedKey} is now ${curr[changedKey].currentStatus}`, type: 'info' });
         setRecentlyUpdatedId(changedKey);
    }

    if (newKeys.length > 0 || changedKey) {
        const timer = setTimeout(() => setNotification(null), 4000);
        const highlightTimer = setTimeout(() => setRecentlyUpdatedId(null), 3000);
        return () => { clearTimeout(timer); clearTimeout(highlightTimer); };
    }

    setLastSyncTime(new Date().toLocaleTimeString());
    setIsSyncing(true);
    
    // Update ref
    prevShipmentsRef.current = shipments;

    const syncTimer = setTimeout(() => setIsSyncing(false), 2000);
    return () => clearTimeout(syncTimer);
  }, [shipments]);

  // Reset selection if the selected shipment was deleted externally
  useEffect(() => {
      if (selectedId && !shipments[selectedId]) {
          setSelectedId('');
          setShowDeleteConfirm(false);
      }
  }, [shipments, selectedId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    // Custom ID Validation
    let finalTrackingId = '';

    if (trackingIdInput.trim()) {
        const customId = trackingIdInput.trim().toUpperCase();
        if (!customId.startsWith('OM')) {
            setCreateError("Tracking ID must start with 'OM'.");
            return;
        }
        if (!/^OM\d{9}$/.test(customId)) {
            setCreateError("Tracking ID must be 'OM' followed by exactly 9 digits.");
            return;
        }
        if (shipments[customId]) {
             setCreateError("Tracking ID already exists.");
             return;
        }
        finalTrackingId = customId;
    } else {
        // Auto Generate if empty
        const randomNums = Math.floor(100000000 + Math.random() * 900000000);
        finalTrackingId = `OM${randomNums}`;
        // Simple collision check (unlikely but safe)
        while (shipments[finalTrackingId]) {
             const r = Math.floor(100000000 + Math.random() * 900000000);
             finalTrackingId = `OM${r}`;
        }
    }

    // Strict Validation
    if (!origin.trim()) { setCreateError("Origin City is required."); return; }
    if (!destination.trim()) { setCreateError("Destination City is required."); return; }
    if (!estDelivery) { setCreateError("Estimated Delivery Date is required."); return; }
    
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
        setCreateError("Origin and Destination cannot be the same.");
        return;
    }

    // Date Validation
    const selectedDate = new Date(estDelivery);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
         setCreateError("Estimated Delivery Date cannot be in the past.");
         return;
    }

    // Format Date for Display (YYYY-MM-DD -> 25 Oct, 2025)
    const formattedDate = selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    let parsedWeight: string | undefined = undefined;
    if (weight.trim()) {
        const w = parseFloat(weight);
        if (isNaN(w) || w <= 0) { setCreateError("Weight must be a valid positive number."); return; }
        parsedWeight = weight.trim();
    }

    let parsedPieces: number | undefined = undefined;
    if (pieceCount.trim()) {
        const p = parseInt(pieceCount);
        if (isNaN(p) || p < 1) { setCreateError("Pieces must be a valid positive integer."); return; }
        parsedPieces = p;
    }

    const newShipment: TrackingData = {
      trackingNumber: finalTrackingId,
      currentStatus: 'Order Created',
      estimatedDelivery: formattedDate, // Use the formatted string
      origin: origin,
      destination: destination,
      weight: parsedWeight,
      dimensions: dimensions.trim() || undefined,
      pieceCount: parsedPieces,
      shipmentType: shipmentType,
      history: [{
        status: 'Order Created',
        location: origin,
        timestamp: new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' GMT',
        details: 'Shipment information received'
      }]
    };

    onCreateShipment(newShipment);
    setGeneratedId(finalTrackingId);
    
    // Reset form
    setTrackingIdInput('');
    setOrigin('');
    setDestination('');
    setEstDelivery('');
    setWeight('');
    setDimensions('');
    setPieceCount('');
    setShipmentType('Parcel');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    const event: TrackingEvent = {
      status: newStatus,
      location: location,
      timestamp: new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' GMT',
      details: details
    };

    onUpdateShipment(selectedId, event);
    alert('Shipment Updated Successfully!');
    setLocation('');
    setDetails('');
  };

  const handleConfirmDelete = () => {
      if (selectedId) {
          onDeleteShipment(selectedId);
          setShowDeleteConfirm(false);
          setSelectedId('');
      }
  };

  // Get current selected shipment for live preview
  const selectedShipmentData = selectedId ? shipments[selectedId] : null;

  // Filtering and Sorting Logic
  const filteredShipments = Object.keys(shipments).filter(id => {
      const s = shipments[id];
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
          id.toLowerCase().includes(searchLower) ||
          s.currentStatus.toLowerCase().includes(searchLower) ||
          s.origin.toLowerCase().includes(searchLower) ||
          s.destination.toLowerCase().includes(searchLower);
      
      const matchesType = filterType === 'all' || s.shipmentType === filterType;

      return matchesSearch && matchesType;
  }).sort((a, b) => {
      const sA = shipments[a];
      const sB = shipments[b];
      
      if (sortBy === 'id') return a.localeCompare(b);
      if (sortBy === 'status') return sA.currentStatus.localeCompare(sB.currentStatus);
      if (sortBy === 'origin') return sA.origin.localeCompare(sB.origin);
      if (sortBy === 'destination') return sA.destination.localeCompare(sB.destination);
      return 0;
  });


  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-md overflow-y-auto flex items-start md:items-center justify-center py-10 px-4 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[120] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[fadeIn_0.3s_ease-out] ${notification.type === 'success' ? 'bg-green-500/20 border-green-500/40 text-green-100' : 'bg-blue-500/20 border-blue-500/40 text-blue-100'}`}>
            <span className="text-xl">{notification.type === 'success' ? '✨' : '🔔'}</span>
            <p className="font-bold text-sm">{notification.message}</p>
        </div>
      )}

      <div className="w-full max-w-5xl bg-gradient-to-br from-gray-900/90 to-black/90 border border-blue-500/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl relative">
        
        {/* Header */}
        <div className="p-8 border-b border-blue-500/20 flex flex-col md:flex-row justify-between items-center gap-6 bg-black/40">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 animate-[textShine_4s_ease-in-out_infinite] bg-[length:200%_auto]">
              Admin Dashboard
            </h2>
            <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                 <p className="text-blue-300/80 text-sm font-medium tracking-wide">Orchid Malaysia Logistics</p>
                 {lastSyncTime && (
                     <span className={`text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 transition-all duration-500 ${isSyncing ? 'bg-blue-500/20 text-blue-300 border-blue-500' : 'bg-transparent text-gray-500 border-gray-700'}`}>
                         Synced: {lastSyncTime}
                     </span>
                 )}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <span className={`w-2 h-2 rounded-full bg-indigo-400 ${isSyncing ? 'animate-ping' : ''}`}></span>
                <span className="text-xs font-bold text-indigo-400 uppercase">Database: {isSyncing ? 'Syncing...' : 'Live'}</span>
             </div>
            <button 
                onClick={onLogout}
                className="group px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-2 active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>

        <div className="p-8">
            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-black/60 rounded-2xl mb-8 max-w-2xl mx-auto border border-blue-500/10">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'create' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transform scale-[1.02]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="text-lg">+</span> Generate Shipment
                </button>
                <button
                    onClick={() => setActiveTab('update')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'update' 
                        ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-sky-500/20 transform scale-[1.02]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="text-lg">↻</span> Update Status
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-black/30 rounded-2xl p-6 md:p-8 border border-blue-500/10 min-h-[400px] transition-all">
            {activeTab === 'create' ? (
                <form onSubmit={handleCreate} className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                
                {/* Custom Tracking ID Input */}
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1">
                         Custom Tracking ID <span className="text-gray-500 lowercase font-normal">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={trackingIdInput}
                        onChange={(e) => { setTrackingIdInput(e.target.value.toUpperCase()); setCreateError(null); }}
                        className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono tracking-wider"
                        placeholder="OM123456789"
                        maxLength={11}
                    />
                    <p className="text-[10px] text-gray-500 mt-2 ml-1">Leave blank to auto-generate a random ID.</p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                        <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">Origin City (From)</label>
                        <input
                        type="text"
                        value={origin}
                        onChange={(e) => { setOrigin(e.target.value); setCreateError(null); }}
                        className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., Yangon, Myanmar"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">Destination City (To)</label>
                        <input
                        type="text"
                        value={destination}
                        onChange={(e) => { setDestination(e.target.value); setCreateError(null); }}
                        className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., Kuala Lumpur"
                        />
                    </div>
                </div>
                
                <div className="group">
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">Estimated Delivery Date</label>
                    <input
                    type="date"
                    value={estDelivery}
                    onChange={(e) => { setEstDelivery(e.target.value); setCreateError(null); }}
                    className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all [color-scheme:dark]"
                    />
                </div>

                {/* Shipment Details Section */}
                <div className="border-t border-blue-500/20 pt-6">
                    <h3 className="text-blue-300 text-sm font-bold uppercase mb-6">Package Details (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Type</label>
                            <select
                                value={shipmentType}
                                onChange={(e) => setShipmentType(e.target.value)}
                                className="w-full bg-black/40 border border-blue-500/20 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-all"
                            >
                                <option value="Parcel">Parcel</option>
                                <option value="Document">Document</option>
                                <option value="Pallet">Pallet</option>
                                <option value="Container">Container</option>
                            </select>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={weight}
                                onChange={(e) => { setWeight(e.target.value); setCreateError(null); }}
                                className="w-full bg-black/40 border border-blue-500/20 rounded-lg p-3 text-white placeholder-gray-700 outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. 5.5"
                            />
                        </div>
                         <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Pieces</label>
                            <input
                                type="number"
                                value={pieceCount}
                                onChange={(e) => { setPieceCount(e.target.value); setCreateError(null); }}
                                className="w-full bg-black/40 border border-blue-500/20 rounded-lg p-3 text-white placeholder-gray-700 outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. 1"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Dimensions</label>
                            <input
                                type="text"
                                value={dimensions}
                                onChange={(e) => { setDimensions(e.target.value); setCreateError(null); }}
                                className="w-full bg-black/40 border border-blue-500/20 rounded-lg p-3 text-white placeholder-gray-700 outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. 20x20x10 cm"
                            />
                        </div>
                    </div>
                </div>

                {createError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-red-300 text-sm font-bold">{createError}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 relative overflow-hidden group"
                >
                    <span className="relative z-10">Generate Tracking ID</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                
                {generatedId && (
                    <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center relative overflow-hidden animate-[fadeInDelay_0.5s_ease-out]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50"></div>
                        <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-2">Shipment Created Successfully</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-4xl md:text-5xl font-black text-white tracking-widest font-mono drop-shadow-lg">{generatedId}</span>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedId);
                                    alert("Copied to clipboard!");
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
                                title="Copy"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
                </form>
            ) : (
                <form onSubmit={handleUpdate} className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 p-3 bg-black/40 border border-blue-500/20 rounded-xl text-sm text-white focus:border-sky-500 outline-none transition-all"
                            placeholder="Search ID, Status, City..."
                        />
                    </div>
                    <div className="relative">
                         <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full p-3 bg-black/40 border border-blue-500/20 rounded-xl text-sm text-gray-300 focus:border-sky-500 outline-none appearance-none"
                         >
                             <option value="id">Sort by ID</option>
                             <option value="status">Sort by Status</option>
                             <option value="origin">Sort by Origin</option>
                             <option value="destination">Sort by Destination</option>
                         </select>
                    </div>
                    <div className="relative">
                         <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full p-3 bg-black/40 border border-blue-500/20 rounded-xl text-sm text-gray-300 focus:border-sky-500 outline-none appearance-none"
                         >
                             <option value="all">All Types</option>
                             <option value="Parcel">Parcel</option>
                             <option value="Document">Document</option>
                             <option value="Pallet">Pallet</option>
                             <option value="Container">Container</option>
                         </select>
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 ml-1">Select Shipment ID</label>
                    <div className="relative">
                        <select
                        required
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none appearance-none cursor-pointer transition-all hover:bg-black/50 font-mono text-sm"
                        >
                        <option value="" className="bg-gray-900">-- Select from {filteredShipments.length} Shipments --</option>
                        {filteredShipments.map(id => (
                            <option key={id} value={id} className={recentlyUpdatedId === id ? "bg-green-900 text-green-200 font-bold" : "bg-gray-900"}>
                                {recentlyUpdatedId === id ? '⚡ ' : ''}{id} • [{shipments[id].currentStatus}] • {shipments[id].origin} → {shipments[id].destination}
                            </option>
                        ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                {/* Live Status Preview Card */}
                {selectedShipmentData && (
                    <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all duration-500 ${recentlyUpdatedId === selectedId ? 'bg-green-500/20 border-green-500 ring-2 ring-green-400 scale-[1.02]' : 'bg-sky-500/5 border-sky-500/20'}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${recentlyUpdatedId === selectedId ? 'text-green-300' : 'text-sky-400'}`}>
                                {recentlyUpdatedId === selectedId ? '⚡ Just Updated' : 'Live Current Status'}
                            </span>
                            <span className="text-[10px] text-gray-500">Real-time Preview</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-blue-400' : recentlyUpdatedId === selectedId ? 'bg-green-400 animate-ping' : 'bg-sky-500'}`}></span>
                            <span className="text-lg font-bold text-white">{selectedShipmentData.currentStatus}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Latest Location: <span className="text-gray-200">{selectedShipmentData.history[0]?.location || selectedShipmentData.origin}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                    <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 ml-1">New Status</label>
                    <div className="relative">
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none appearance-none cursor-pointer transition-all hover:bg-black/50"
                        >
                            <option value="Shipment Picked Up" className="bg-gray-900">Shipment Picked Up</option>
                            <option value="Arrived at Hub" className="bg-gray-900">Arrived at Hub</option>
                            <option value="Departed from Hub" className="bg-gray-900">Departed from Hub</option>
                            <option value="In Transit" className="bg-gray-900">In Transit</option>
                            <option value="Arrived at Destination Facility" className="bg-gray-900">Arrived at Destination Facility</option>
                            <option value="Out for Delivery" className="bg-gray-900">Out for Delivery</option>
                            <option value="Delivered" className="bg-gray-900">Delivered</option>
                            <option value="On Hold" className="bg-gray-900">On Hold</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                    </div>
                    <div className="group">
                    <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-sky-400 transition-colors">Current Location</label>
                    <input
                        required
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                        placeholder="City, Country"
                    />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-sky-400 transition-colors">Details / Comments</label>
                    <input
                    required
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    placeholder="e.g., Arrived at sorting facility"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-sky-600 to-cyan-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-sky-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 relative overflow-hidden group"
                >
                    <span className="relative z-10">Update Status</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                {selectedId && (
                    <div className="mt-8 pt-6 border-t border-red-500/20">
                        <h3 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-4">Danger Zone</h3>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            Delete Shipment {selectedId}
                        </button>
                    </div>
                )}
                </form>
            )}
            </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out] cursor-pointer"
            onClick={() => setShowDeleteConfirm(false)}
        >
            <div 
                className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-900/20 relative overflow-hidden cursor-auto"
                onClick={(e) => e.stopPropagation()}
            >
                 {/* Background Glow */}
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none"></div>
                
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Delete Shipment?</h3>
                <p className="text-gray-400 text-sm mb-6 relative z-10">
                    Are you sure you want to permanently delete <span className="text-white font-mono font-bold bg-red-500/10 px-1.5 py-0.5 rounded">{selectedId}</span>? 
                    This action cannot be undone.
                </p>
                <div className="flex gap-3 relative z-10">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors active:scale-95"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmDelete}
                        className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
