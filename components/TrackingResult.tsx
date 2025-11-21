
import React, { useState } from 'react';
import type { TrackingData, TrackingEvent } from '../types';

interface TrackingResultProps {
  data: TrackingData;
}

const statusIcons: { [key: string]: React.ReactNode } = {
  'Delivered': <CheckCircleIcon />,
  'Out for Delivery': <TruckIcon />,
  'In Transit': <PlaneIcon />,
  'Arrived at Destination Facility': <WarehouseIcon />,
  'Departed from Hub': <PlaneDepartIcon />,
  'Arrived at Hub': <WarehouseIcon />,
  'Shipment Picked Up': <PackageCheckIcon />,
  'Order Created': <ClipboardIcon />,
  'On Hold': <AlertIcon />,
};

export default function TrackingResult({ data }: TrackingResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Logic to extract day and format delivery info
  const getDeliveryInfo = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const isValidDate = !isNaN(date.getTime());
      
      return {
          day: isValidDate ? date.toLocaleDateString('en-US', { weekday: 'long' }) : '',
          timeWindow: 'Between 14:00 - 17:00'
      };
  };

  const deliveryInfo = getDeliveryInfo(data.estimatedDelivery);
  const hasShipmentDetails = data.weight || data.dimensions || data.pieceCount || data.shipmentType;
  const isDelivered = data.currentStatus === 'Delivered';

  return (
    <div className="w-full text-left">
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-white">Tracking ID: <span className="text-blue-400">{data.trackingNumber}</span></h3>
            <button 
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all active:scale-95 relative group"
                title="Copy Tracking ID"
            >
                {copied ? <CheckIconSmall /> : <CopyIcon />}
                {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded shadow-lg animate-fade-in-up">
                        Copied!
                    </span>
                )}
            </button>
        </div>
        <div className="text-sm font-mono text-gray-400 bg-black/30 px-3 py-1 rounded-full border border-white/10">
            Global Express
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black/20 p-4 rounded-xl border border-blue-500/20 flex flex-col justify-between">
          <div>
             <p className="text-sm text-blue-300">Current Status</p>
             <div className={`font-bold text-lg flex items-center gap-2 ${data.currentStatus === 'On Hold' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                 {data.currentStatus === 'On Hold' && <span className="animate-pulse">⚠️</span>}
                 {data.currentStatus}
             </div>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-blue-500/20 flex flex-col justify-between">
          <div>
              <p className="text-sm text-blue-300 mb-1">{isDelivered ? 'Delivered On' : 'Estimated Delivery'}</p>
              <p className="font-bold text-white text-xl">{data.estimatedDelivery}</p>
          </div>
          {deliveryInfo && !isDelivered && (
              <div className="mt-3 flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-blue-400 bg-blue-500/10 p-1.5 rounded-md">
                     <ClockIcon />
                  </div>
                  <div className="flex flex-col">
                       <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-tight">Time Window</span>
                       <span className="text-sm font-bold text-blue-100">
                           {deliveryInfo.day ? `${deliveryInfo.day}, ` : ''}09:00 AM - 06:00 PM
                       </span>
                  </div>
              </div>
          )}
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-blue-500/20 flex flex-col justify-between">
            <div>
                <p className="text-sm text-blue-300">Route</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-white">{data.origin}</span>
                    <span className="text-gray-500">&rarr;</span>
                    <span className="font-semibold text-white">{data.destination}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Shipment Details - Shown only if available */}
      {hasShipmentDetails && (
        <div className="bg-black/30 border border-gray-700 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <h4 className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Shipment Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {data.shipmentType && (
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><BoxIcon /></div>
                         <div>
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Type</p>
                             <p className="text-white font-medium">{data.shipmentType}</p>
                         </div>
                     </div>
                 )}
                 {data.weight && (
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><ScaleIcon /></div>
                         <div>
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Weight</p>
                             <p className="text-white font-medium">{data.weight} kg</p>
                         </div>
                     </div>
                 )}
                 {data.pieceCount !== undefined && (
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><LayersIcon /></div>
                         <div>
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Pieces</p>
                             <p className="text-white font-medium">{data.pieceCount}</p>
                         </div>
                     </div>
                 )}
                 {data.dimensions && (
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><RulerIcon /></div>
                         <div>
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Dimensions</p>
                             <p className="text-white font-medium">{data.dimensions}</p>
                         </div>
                     </div>
                 )}
            </div>
        </div>
      )}

      <h4 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-blue-500">Shipment History</h4>
      <div className="space-y-6 pl-2 md:pl-4">
        {data.history.map((event, index) => (
          <TrackingEventItem key={index} event={event} isFirst={index === 0} />
        ))}
      </div>
    </div>
  );
}

interface TrackingEventItemProps {
  event: TrackingEvent;
  isFirst: boolean;
}

const TrackingEventItem: React.FC<TrackingEventItemProps> = ({ event, isFirst }) => (
  <div className="relative pl-8 pb-4 border-l border-gray-700 last:border-0">
    <div className={`absolute -left-[17px] top-0 h-9 w-9 rounded-full flex items-center justify-center border-4 border-gray-900 ${isFirst ? event.status === 'On Hold' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
        {statusIcons[event.status] || <PackageIcon/>}
    </div>
    <div>
      <p className={`font-bold text-lg ${isFirst ? event.status === 'On Hold' ? 'text-yellow-400' : 'text-blue-400' : 'text-gray-300'}`}>{event.status}</p>
      <p className="text-sm text-gray-400">{event.location}</p>
      <p className="text-xs text-gray-500 mb-1">{event.timestamp}</p>
      <p className="text-sm text-gray-300 bg-white/5 p-2 rounded-lg inline-block border border-white/5">{event.details}</p>
    </div>
  </div>
);


// SVG Icons (Kept simple for clean look)
function CheckCircleIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function TruckIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function PlaneIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1.5-1.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>; }
function WarehouseIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.17 6.5l8-4.2a2 2 0 0 1 1.66 0l8 4.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect x="10" y="12" width="4" height="10"/></svg>; }
function PlaneDepartIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12H3.5a2.5 2.5 0 1 1 0-5H15l4.35 4.69a2 2 0 0 1 0 2.62L15 19v-4.5a2.5 2.5 0 0 0-2.5-2.5V12Z"/><path d="M3 21h18"/></svg>; }
function PackageCheckIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.4 9.5a2 2 0 1 1-2.9 2.9"/><path d="m21 16-4-4-1.5 1.5"/><path d="M12 2v4"/><path d="M18.37 7.63.5 15.5l-3 3.01h.01"/><path d="m7.63 18.37-4-4"/><path d="M2 12h4"/><path d="m4.22 19.78 3-3"/><path d="M15.5 21.5 12 18l-1.5 1.5"/><path d="M12 22v-4"/></svg>; }
function ClipboardIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>; }
function PackageIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2"/><path d="M12 12 3.1 7.5"/><path d="M12 12 20.9 7.5"/><path d="M12 22V12"/><path d="M18.7 14.3 12 18l-6.7-3.7"/><path d="M3.1 16.5 12 22l8.9-5.5"/></svg>; }
function AlertIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>; }
function CopyIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>; }
function CheckIconSmall() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polyline points="20 6 9 17 4 12"></polyline></svg>; }
function ClockIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function ScaleIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>; }
function BoxIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function RulerIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>; }
function LayersIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>; }
