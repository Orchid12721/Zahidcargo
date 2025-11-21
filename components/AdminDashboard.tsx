
import React, { useState } from 'react';
import type { TrackingData, TrackingEvent } from '../types';

interface AdminDashboardProps {
  shipments: { [key: string]: TrackingData };
  onCreateShipment: (data: TrackingData) => void;
  onUpdateShipment: (trackingNumber: string, event: TrackingEvent) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ shipments, onCreateShipment, onUpdateShipment, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'update'>('create');
  
  // Create Shipment State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [estDelivery, setEstDelivery] = useState('');
  
  // New fields for details
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [pieceCount, setPieceCount] = useState('');
  const [shipmentType, setShipmentType] = useState('Parcel');

  const [generatedId, setGeneratedId] = useState<string | null>(null);

  // Update Shipment State
  const [selectedId, setSelectedId] = useState('');
  const [newStatus, setNewStatus] = useState('In Transit');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const randomNums = Math.floor(100000000 + Math.random() * 900000000);
    // Changed prefix to OM for Orchid Malaysia
    const newId = `OM${randomNums}`;
    
    const newShipment: TrackingData = {
      trackingNumber: newId,
      currentStatus: 'Order Created',
      estimatedDelivery: estDelivery,
      origin: origin,
      destination: destination,
      weight: weight || undefined,
      dimensions: dimensions || undefined,
      pieceCount: pieceCount ? parseInt(pieceCount) : undefined,
      shipmentType: shipmentType,
      history: [{
        status: 'Order Created',
        location: origin,
        timestamp: new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' GMT',
        details: 'Shipment information received'
      }]
    };

    onCreateShipment(newShipment);
    setGeneratedId(newId);
    
    // Reset form
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

  return (
    <div className="fixed inset-0 z-[100] bg-[#02040a]/95 backdrop-blur-md overflow-y-auto flex items-start md:items-center justify-center py-10 px-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-5xl bg-gradient-to-br from-gray-900/90 to-black/90 border border-green-500/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Header */}
        <div className="p-8 border-b border-green-500/20 flex flex-col md:flex-row justify-between items-center gap-6 bg-black/40">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 animate-[textShine_4s_ease-in-out_infinite] bg-[length:200%_auto]">
              Admin Dashboard
            </h2>
            <p className="text-green-300/80 text-sm font-medium mt-1 tracking-wide">Orchid Malaysia Logistics Management</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-400 uppercase">Database: Online</span>
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
            <div className="flex p-1.5 bg-black/60 rounded-2xl mb-8 max-w-2xl mx-auto border border-green-500/10">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'create' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20 transform scale-[1.02]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="text-lg">+</span> Generate Shipment
                </button>
                <button
                    onClick={() => setActiveTab('update')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'update' 
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20 transform scale-[1.02]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="text-lg">↻</span> Update Status
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-black/30 rounded-2xl p-6 md:p-8 border border-green-500/10 min-h-[400px] transition-all">
            {activeTab === 'create' ? (
                <form onSubmit={handleCreate} className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                        <label className="block text-xs font-bold text-green-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-green-400 transition-colors">Origin City (From)</label>
                        <input
                        required
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full bg-black/40 border border-green-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        placeholder="e.g., Yangon, Myanmar"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold text-green-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-green-400 transition-colors">Destination City (To)</label>
                        <input
                        required
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-black/40 border border-green-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        placeholder="e.g., Kuala Lumpur"
                        />
                    </div>
                </div>
                
                <div className="group">
                    <label className="block text-xs font-bold text-green-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-green-400 transition-colors">Estimated Delivery Date</label>
                    <input
                    required
                    type="text"
                    value={estDelivery}
                    onChange={(e) => setEstDelivery(e.target.value)}
                    className="w-full bg-black/40 border border-green-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                    placeholder="e.g., 25 Oct, 2025"
                    />
                </div>

                {/* Shipment Details Section */}
                <div className="border-t border-green-500/20 pt-6">
                    <h3 className="text-green-300 text-sm font-bold uppercase mb-6">Package Details (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Type</label>
                            <select
                                value={shipmentType}
                                onChange={(e) => setShipmentType(e.target.value)}
                                className="w-full bg-black/40 border border-green-500/20 rounded-lg p-3 text-white outline-none focus:border-green-500 transition-all"
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
                                type="text"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full bg-black/40 border border-green-500/20 rounded-lg p-3 text-white placeholder-gray-700 outline-none focus:border-green-500 transition-all"
                                placeholder="e.g. 5.5"
                            />
                        </div>
                         <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Pieces</label>
                            <input
                                type="number"
                                value={pieceCount}
                                onChange={(e) => setPieceCount(e.target.value)}
                                className="w-full bg-black/40 border border-green-500/20 rounded-lg p-3 text-white placeholder-gray-700 outline-none focus:border-green-500 transition-all"
                                placeholder="e.g. 1"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Dimensions</label>
                            <input
                                type="text"
                                value={dimensions}
                                onChange={(e) => setDimensions(e.target.value)}
                                className="w-full bg-black/40 border border-green-500/20 rounded-lg p-3 text-white placeholder-gray-700 outline-none focus:border-green-500 transition-all"
                                placeholder="e.g. 20x20x10 cm"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 relative overflow-hidden group"
                >
                    <span className="relative z-10">Generate Tracking ID</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                
                {generatedId && (
                    <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center relative overflow-hidden animate-[fadeInDelay_0.5s_ease-out]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
                        <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2">Shipment Created Successfully</p>
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
                <div className="group">
                    <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-2 ml-1">Select Shipment ID</label>
                    <div className="relative">
                        <select
                        required
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full bg-black/40 border border-green-500/20 rounded-xl p-4 pl-5 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none cursor-pointer transition-all hover:bg-black/50"
                        >
                        <option value="" className="bg-gray-900">-- Choose Tracking ID --</option>
                        {Object.keys(shipments).map(id => (
                            <option key={id} value={id} className="bg-gray-900">{id} • {shipments[id].origin} → {shipments[id].destination}</option>
                        ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                    <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-2 ml-1">New Status</label>
                    <div className="relative">
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full bg-black/40 border border-green-500/20 rounded-xl p-4 pl-5 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none cursor-pointer transition-all hover:bg-black/50"
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
                    <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-teal-400 transition-colors">Current Location</label>
                    <input
                        required
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-black/40 border border-green-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                        placeholder="City, Country"
                    />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-teal-400 transition-colors">Details / Comments</label>
                    <input
                    required
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-black/40 border border-green-500/20 rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    placeholder="e.g., Arrived at sorting facility"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-teal-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 relative overflow-hidden group"
                >
                    <span className="relative z-10">Update Status</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                </form>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}
