
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
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
