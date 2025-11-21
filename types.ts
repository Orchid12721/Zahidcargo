
export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  details: string;
}

export interface TrackingData {
  trackingNumber: string;
  currentStatus: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
  history: TrackingEvent[];
  // New optional fields for shipment details
  weight?: string;
  dimensions?: string;
  pieceCount?: number;
  shipmentType?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
