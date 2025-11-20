
import React from 'react';
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
};

export default function TrackingResult({ data }: TrackingResultProps) {
  return (
    <div className="w-full text-left">
      <h3 className="text-2xl font-bold text-white mb-6 text-center md:text-left">Tracking Details for {data.trackingNumber}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/20 p-4 rounded-xl border border-purple-500/20">
          <p className="text-sm text-purple-300">Current Status</p>
          <p className="font-bold text-green-400 text-lg">{data.currentStatus}</p>
        </div>
        <div className="bg-black/20 p-4 rounded-xl border border-purple-500/20">
          <p className="text-sm text-purple-300">Estimated Delivery</p>
          <p className="font-bold text-white text-lg">{data.estimatedDelivery}</p>
        </div>
        <div className="bg-black/20 p-4 rounded-xl border border-purple-500/20">
            <p className="text-sm text-purple-300">Route</p>
            <p className="font-semibold text-white">{data.origin} &rarr; {data.destination}</p>
        </div>
      </div>

      <h4 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-purple-500">Shipment History</h4>
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
    <div className={`absolute -left-[17px] top-0 h-9 w-9 rounded-full flex items-center justify-center border-4 border-gray-900 ${isFirst ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
        {statusIcons[event.status] || <PackageIcon/>}
    </div>
    <div>
      <p className={`font-bold text-lg ${isFirst ? 'text-purple-400' : 'text-gray-300'}`}>{event.status}</p>
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
