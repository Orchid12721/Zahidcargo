
import React, { useState, useEffect, useRef } from 'react';
import type { TrackingData, TrackingEvent } from '../types';

interface AdminDashboardProps {
  shipments: { [key: string]: TrackingData };
  onCreateShipment: (data: TrackingData) => void;
  onUpdateShipment: (trackingNumber: string, event: TrackingEvent) => void;
  onEditShipment: (data: TrackingData) => void; // New prop for editing core data
  onDeleteShipment: (trackingNumber: string) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ shipments, onCreateShipment, onUpdateShipment, onEditShipment, onDeleteShipment, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'update'>('create');
  
  // Create Shipment State
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [estDelivery, setEstDelivery] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [pieceCount, setPieceCount] = useState('');
  const [shipmentType, setShipmentType] = useState('Parcel');
  
  // Validation State
  const [createError, setCreateError] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  // Update/Manage Shipment State
  const [selectedId, setSelectedId] = useState('');
  const [newStatus, setNewStatus] = useState('In Transit');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');

  // Editing Mode State (for Update Tab)
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editOrigin, setEditOrigin] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editPieces, setEditPieces] = useState('');
  const [editType, setEditType] = useState('');

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
  
  const prevShipmentsRef = useRef(shipments);

  // Effect: Populate Edit Fields when a shipment is selected
  useEffect(() => {
    if (selectedId && shipments[selectedId]) {
        const s = shipments[selectedId];
        setEditOrigin(s.origin);
        setEditDestination(s.destination);
        setEditWeight(s.weight || '');
        setEditPieces(s.pieceCount ? s.pieceCount.toString() : '');
        setEditType(s.shipmentType || 'Parcel');
        setIsEditingDetails(false); // Reset edit mode on selection change
    }
  }, [selectedId, shipments]);

  // Real-time handling (Same as before)
  useEffect(() => {
    const prev = prevShipmentsRef.current;
    const curr = shipments;
    const prevKeys = Object.keys(prev);
    const currKeys = Object.keys(curr);

    const newKeys = currKeys.filter(k => !prevKeys.includes(k));
    if (newKeys.length > 0) {
        if (newKeys[0] !== generatedId) {
             setNotification({ message: `New Shipment Received: ${newKeys.join(', ')}`, type: 'success' });
             setRecentlyUpdatedId(newKeys[0]);
        }
    }

    const changedKey = currKeys.find(k => prevKeys.includes(k) && prev[k].currentStatus !== curr[k].currentStatus);
    if (changedKey) {
         setNotification({ message: `Update: ${changedKey} is now ${curr[changedKey].currentStatus}`, type: 'info' });
         setRecentlyUpdatedId(changedKey);
    }

    if ((newKeys.length > 0 && newKeys[0] !== generatedId) || changedKey) {
        const timer = setTimeout(() => setNotification(null), 4000);
        const highlightTimer = setTimeout(() => setRecentlyUpdatedId(null), 3000);
        return () => { clearTimeout(timer); clearTimeout(highlightTimer); };
    }

    setLastSyncTime(new Date().toLocaleTimeString());
    setIsSyncing(true);
    prevShipmentsRef.current = shipments;
    const syncTimer = setTimeout(() => setIsSyncing(false), 2000);
    return () => clearTimeout(syncTimer);
  }, [shipments, generatedId]);

  useEffect(() => {
      if (selectedId && !shipments[selectedId]) {
          setSelectedId('');
          setShowDeleteConfirm(false);
      }
  }, [shipments, selectedId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    let finalTrackingId = '';
    if (trackingIdInput.trim()) {
        const customId = trackingIdInput.trim().toUpperCase();
        if (!customId.startsWith('OM')) { setCreateError("Tracking ID must start with 'OM'."); return; }
        if (!/^OM\d{9}$/.test(customId)) { setCreateError("Tracking ID must be 'OM' followed by exactly 9 digits."); return; }
        if (shipments[customId]) { setCreateError("Tracking ID already exists."); return; }
        finalTrackingId = customId;
    } else {
        const randomNums = Math.floor(100000000 + Math.random() * 900000000);
        finalTrackingId = `OM${randomNums}`;
        while (shipments[finalTrackingId]) {
             const r = Math.floor(100000000 + Math.random() * 900000000);
             finalTrackingId = `OM${r}`;
        }
    }

    if (!origin.trim() || !destination.trim() || !estDelivery) { setCreateError("Required fields missing."); return; }
    
    const selectedDate = new Date(estDelivery);
    const formattedDate = selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    let parsedWeight = weight.trim() ? weight.trim() : undefined;
    let parsedPieces = pieceCount.trim() ? parseInt(pieceCount) : undefined;

    const newShipment: TrackingData = {
      trackingNumber: finalTrackingId,
      currentStatus: 'Order Created',
      estimatedDelivery: formattedDate,
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
    setNotification({ message: `Shipment ${finalTrackingId} Created Successfully!`, type: 'success' });
    setTimeout(() => setNotification(null), 5000);
    
    setTrackingIdInput(''); setOrigin(''); setDestination(''); setEstDelivery('');
    setWeight(''); setDimensions(''); setPieceCount(''); setShipmentType('Parcel');
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    const event: TrackingEvent = {
      status: newStatus,
      location: location,
      timestamp: new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' GMT',
      details: details
    };

    onUpdateShipment(selectedId, event);
    setNotification({ message: `Shipment ${selectedId} updated successfully.`, type: 'success' });
    setTimeout(() => setNotification(null), 4000);
    setLocation(''); setDetails('');
  };

  // Handler for saving edited core details
  const handleSaveDetails = () => {
      if (!selectedId) return;
      const currentData = shipments[selectedId];
      
      const updatedData: TrackingData = {
          ...currentData,
          origin: editOrigin,
          destination: editDestination,
          weight: editWeight,
          pieceCount: editPieces ? parseInt(editPieces) : undefined,
          shipmentType: editType
      };

      onEditShipment(updatedData);
      setIsEditingDetails(false);
      setNotification({ message: `Details for ${selectedId} saved.`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmDelete = () => {
      if (selectedId) {
          onDeleteShipment(selectedId);
          setShowDeleteConfirm(false);
          setSelectedId('');
          setNotification({ message: `Shipment deleted.`, type: 'info' });
          setTimeout(() => setNotification(null), 4000);
      }
  };

  const selectedShipmentData = selectedId ? shipments[selectedId] : null;

  // Fuzzy Search Logic
  const getLevenshteinDistance = (a: string, b: string) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
  };

  const filteredShipments = Object.keys(shipments).filter(id => {
      const s = shipments[id];
      const searchLower = searchQuery.toLowerCase().trim();
      if (!searchLower) return filterType === 'all' || s.shipmentType === filterType;

      const targetStrings = [id, s.currentStatus, s.origin, s.destination];
      const matchesDirect = targetStrings.some(str => str.toLowerCase().includes(searchLower));
      
      let matchesFuzzy = false;
      if (!matchesDirect && searchLower.length > 2) {
          matchesFuzzy = targetStrings.some(str => {
             const words = str.split(' ');
             // Check full string distance or individual word distance
             if (getLevenshteinDistance(searchLower, str.toLowerCase()) <= 2) return true;
             return words.some(w => getLevenshteinDistance(searchLower, w.toLowerCase()) <= 2);
          });
      }

      const matchesType = filterType === 'all' || s.shipmentType === filterType;
      return (matchesDirect || matchesFuzzy) && matchesType;
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
            <button 
                onClick={onLogout}
                className="group px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-2 active:scale-95"
            >
                <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>

        <div className="p-8">
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
                    <span className="text-lg">✎</span> Manage Shipments
                </button>
            </div>

            <div className="bg-black/30 rounded-2xl p-6 md:p-8 border border-blue-500/10 min-h-[400px] transition-all">
            {activeTab === 'create' ? (
                <form onSubmit={handleCreate} className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                 {/* Create Form Content (Kept same as previous for brevity, focused on logic) */}
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1">Custom Tracking ID <span className="text-gray-500 font-normal">(optional)</span></label>
                    <input type="text" value={trackingIdInput} onChange={(e) => { setTrackingIdInput(e.target.value.toUpperCase()); setCreateError(null); }} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-blue-500 outline-none font-mono tracking-wider" placeholder="OM123456789" maxLength={11} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group"><label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1">Origin</label><input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="e.g., Yangon" /></div>
                    <div className="group"><label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1">Destination</label><input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="e.g., Kuala Lumpur" /></div>
                </div>
                <div className="group"><label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 ml-1">Est. Delivery Date</label><input type="date" value={estDelivery} onChange={(e) => setEstDelivery(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 text-white focus:border-blue-500 outline-none [color-scheme:dark]" /></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="group"><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Type</label><select value={shipmentType} onChange={(e) => setShipmentType(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-lg p-3 text-white focus:border-blue-500"><option value="Parcel">Parcel</option><option value="Document">Document</option></select></div>
                     <div className="group"><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Weight (kg)</label><input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-lg p-3 text-white focus:border-blue-500" placeholder="5.5" /></div>
                     <div className="group"><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Pieces</label><input type="number" value={pieceCount} onChange={(e) => setPieceCount(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-lg p-3 text-white focus:border-blue-500" placeholder="1" /></div>
                </div>
                {createError && <p className="text-red-400 text-sm font-bold">{createError}</p>}
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all">Generate Tracking ID</button>
                {generatedId && <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center"><p className="text-indigo-400 text-xs uppercase font-bold mb-2">Generated ID</p><span className="text-3xl font-mono text-white font-black">{generatedId}</span></div>}
                </form>
            ) : (
                <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                {/* Search & Sort */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-3 bg-black/40 border border-blue-500/20 rounded-xl text-sm text-white focus:border-sky-500 outline-none" placeholder="Search ID, Status, City..." />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full p-3 bg-black/40 border border-blue-500/20 rounded-xl text-sm text-gray-300 focus:border-sky-500 outline-none"><option value="id">Sort by ID</option><option value="status">Sort by Status</option></select>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full p-3 bg-black/40 border border-blue-500/20 rounded-xl text-sm text-gray-300 focus:border-sky-500 outline-none"><option value="all">All Types</option><option value="Parcel">Parcel</option><option value="Document">Document</option></select>
                </div>

                {/* Shipment Selector */}
                <div className="group">
                    <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 ml-1">Select Shipment to View/Edit</label>
                    <div className="relative">
                        <select required value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-4 pl-5 text-white focus:border-sky-500 outline-none appearance-none cursor-pointer transition-all hover:bg-black/50 font-mono text-sm">
                        <option value="" className="bg-gray-900">-- Select from {filteredShipments.length} Shipments --</option>
                        {filteredShipments.map(id => (
                            <option key={id} value={id} className={recentlyUpdatedId === id ? "bg-green-900 text-green-200" : "bg-gray-900"}>{recentlyUpdatedId === id ? '⚡ ' : ''}{id} • {shipments[id].currentStatus}</option>
                        ))}
                        </select>
                    </div>
                </div>

                {/* Selected Shipment Dashboard */}
                {selectedShipmentData && (
                    <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
                        
                        {/* 1. Shipment Overview & Edit Card */}
                        <div className="p-6 bg-sky-500/5 border border-sky-500/20 rounded-2xl">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                <h3 className="text-sky-400 font-bold uppercase tracking-wider text-sm">Shipment Overview</h3>
                                <button 
                                    onClick={() => setIsEditingDetails(!isEditingDetails)}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-sky-500/30 text-sky-300 hover:bg-sky-500/10 transition-colors"
                                >
                                    {isEditingDetails ? 'Cancel Editing' : 'Edit Details'}
                                </button>
                            </div>

                            {isEditingDetails ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                    <div><label className="text-[10px] text-gray-500 uppercase">Origin</label><input value={editOrigin} onChange={e => setEditOrigin(e.target.value)} className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-white text-sm"/></div>
                                    <div><label className="text-[10px] text-gray-500 uppercase">Destination</label><input value={editDestination} onChange={e => setEditDestination(e.target.value)} className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-white text-sm"/></div>
                                    <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
                                        <div><label className="text-[10px] text-gray-500 uppercase">Weight</label><input value={editWeight} onChange={e => setEditWeight(e.target.value)} className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-white text-sm"/></div>
                                        <div><label className="text-[10px] text-gray-500 uppercase">Pieces</label><input value={editPieces} onChange={e => setEditPieces(e.target.value)} className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-white text-sm"/></div>
                                        <div><label className="text-[10px] text-gray-500 uppercase">Type</label><select value={editType} onChange={e => setEditType(e.target.value)} className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-white text-sm"><option value="Parcel">Parcel</option><option value="Document">Document</option></select></div>
                                    </div>
                                    <button onClick={handleSaveDetails} className="col-span-1 md:col-span-2 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm mt-2 shadow-lg shadow-green-900/20">Save Changes</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div><p className="text-[10px] text-gray-500 uppercase font-bold">Tracking ID</p><p className="text-white font-mono text-lg">{selectedId}</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase font-bold">Route</p><p className="text-white">{selectedShipmentData.origin} &rarr; {selectedShipmentData.destination}</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase font-bold">Package</p><p className="text-white">{selectedShipmentData.weight || '-'}kg / {selectedShipmentData.pieceCount || '-'} pcs</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase font-bold">Status</p><span className="text-sky-400 font-bold">{selectedShipmentData.currentStatus}</span></div>
                                </div>
                            )}
                        </div>

                        {/* 2. Add New Status Update */}
                        <div className="p-6 bg-gray-900/50 border border-gray-700 rounded-2xl">
                            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-4">Update Status</h3>
                            <form onSubmit={handleUpdateStatus} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white focus:border-sky-500 outline-none"><option value="In Transit">In Transit</option><option value="Out for Delivery">Out for Delivery</option><option value="Delivered">Delivered</option><option value="On Hold">On Hold</option><option value="Arrived at Hub">Arrived at Hub</option></select>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white placeholder-gray-600 focus:border-sky-500 outline-none" placeholder="Current Location" required />
                                </div>
                                <input type="text" value={details} onChange={(e) => setDetails(e.target.value)} className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white placeholder-gray-600 focus:border-sky-500 outline-none" placeholder="Comments" required />
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-600 rounded-xl text-white font-bold shadow-lg active:scale-95 transition-all">Add Status Update</button>
                            </form>
                        </div>

                        {/* 3. Full History Log */}
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 max-h-60 overflow-y-auto">
                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-3 sticky top-0 bg-transparent">Full History Log</h3>
                            <div className="space-y-3">
                                {selectedShipmentData.history.map((evt, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm border-b border-white/5 pb-2 last:border-0">
                                        <div className="text-gray-500 font-mono text-xs w-24 flex-shrink-0">{evt.timestamp.split(',')[0]}</div>
                                        <div>
                                            <div className="text-sky-300 font-bold">{evt.status}</div>
                                            <div className="text-gray-400">{evt.location} - {evt.details}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Danger Zone */}
                        <div className="pt-6 border-t border-red-500/20">
                            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold hover:bg-red-500/20 transition-all">Delete Shipment {selectedId}</button>
                        </div>
                    </div>
                )}
                </div>
            )}
            </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Delete Shipment?</h3>
                <p className="text-gray-400 text-sm mb-6">Permanently delete <span className="text-white font-mono font-bold">{selectedId}</span>? This cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-gray-800 text-white rounded-lg">Cancel</button>
                    <button onClick={handleConfirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold">Yes, Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
