
import React, { useState } from 'react';
import Header from './components/Header';
import TrackingForm from './components/TrackingForm';
import TrackingResult from './components/TrackingResult';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import type { TrackingData } from './types';

// Mock data for demonstration purposes
const MOCK_TRACKING_DATA: { [key: string]: TrackingData } = {
  'ZC123456789': {
    trackingNumber: 'ZC123456789',
    currentStatus: 'In Transit',
    estimatedDelivery: '25 July, 2024',
    origin: 'Yangon, Myanmar',
    destination: 'Singapore, Singapore',
    history: [
      { status: 'Delivered', location: 'Singapore, SG', timestamp: '2024-07-25 14:30 GMT', details: 'Successfully delivered and signed.' },
      { status: 'Out for Delivery', location: 'Singapore, SG', timestamp: '2024-07-25 08:15 GMT', details: 'Onboard for delivery.' },
      { status: 'Arrived at Destination Facility', location: 'Singapore, SG', timestamp: '2024-07-24 22:45 GMT', details: 'Processed at sorting facility.' },
      { status: 'Departed from Hub', location: 'Bangkok, TH', timestamp: '2024-07-23 11:00 GMT', details: 'In transit to destination country.' },
      { status: 'Arrived at Hub', location: 'Bangkok, TH', timestamp: '2024-07-22 19:30 GMT', details: 'Package arrived at transit hub.' },
      { status: 'Shipment Picked Up', location: 'Yangon, MM', timestamp: '2024-07-21 16:00 GMT', details: 'Package received from shipper.' },
      { status: 'Order Created', location: 'Yangon, MM', timestamp: '2024-07-21 10:00 GMT', details: 'Shipping information received.' },
    ],
  },
};

export default function App() {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = (trackingNumber: string) => {
    setIsLoading(true);
    setError(null);
    setTrackingData(null);

    const formattedNumber = trackingNumber.toUpperCase().trim();
    if (!formattedNumber.startsWith('ZC')) {
      setError("Invalid format. Zahid Cargo tracking numbers must start with 'ZC'.");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const data = MOCK_TRACKING_DATA[formattedNumber];
      if (data) {
        setTrackingData(data);
      } else {
        setError('Tracking number not found. Please check details and try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="content-wrapper">
        <Header />

        {/* Hero Section */}
        <section className="hero">
            <div className="hero-content">
                <h2>Track Your Parcel</h2>
                <p>Premium door-to-door delivery service across the globe. Your precious parcels, delivered with care and precision.</p>
                <div className="badges">
                    <div className="badge">
                        <div className="badge-dot green"></div>
                        <span>Real-time Tracking</span>
                    </div>
                    <div className="badge">
                        <div className="badge-dot blue"></div>
                        <span>Global Coverage</span>
                    </div>
                    <div className="badge">
                        <div className="badge-dot purple"></div>
                        <span>24/7 Support</span>
                    </div>
                </div>
            </div>
        </section>

        {/* Main Content */}
        <main>
            <div className="container mx-auto">
                <div className="tracking-card">
                    <h3>Check Your Package Status</h3>
                    <p>Enter your tracking ID to see real-time updates</p>
                    <TrackingForm 
                        onTrack={handleTrack} 
                        isLoading={isLoading} 
                        error={error}
                        onClearError={() => setError(null)}
                    />
                </div>

                {/* Result Area - Dynamic content based on state */}
                <div className={`result-area ${trackingData ? 'result-area-filled' : ''}`} id="resultArea">
                    {trackingData ? (
                        <TrackingResult data={trackingData} />
                    ) : error ? (
                         <div className="text-center">
                             <svg className="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#ef4444', opacity: 1}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p style={{color: '#f87171', fontWeight: 600}}>{error}</p>
                        </div>
                    ) : (
                        <>
                            <svg className="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p>Your package tracking information will appear here</p>
                            <p className="text-sm text-gray-500 mt-3">Enter a tracking ID above to get started</p>
                        </>
                    )}
                </div>
            </div>
        </main>

        {/* Delivery Process Section */}
        <section className="delivery-section">
            <div className="delivery-content">
                <h2>Our Delivery Process</h2>
                <p>From warehouse to your doorstep, we ensure your parcels arrive safely and on time</p>
                
                <div className="process-grid">
                    <div className="process-card">
                        <div className="process-number">1</div>
                        <div className="process-image-container">
                            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop" alt="Warehouse Processing" className="process-image" />
                        </div>
                        <h3>Warehouse Processing</h3>
                        <p>Your parcels are carefully packaged and prepared for shipping in our state-of-the-art facility</p>
                    </div>

                    <div className="process-card">
                        <div className="process-number">2</div>
                        <div className="process-image-container">
                            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" alt="Global Shipping" className="process-image" />
                        </div>
                        <h3>Global Shipping</h3>
                        <p>Fast and reliable air or sea freight to deliver your package across continents</p>
                    </div>

                    <div className="process-card">
                        <div className="process-number">3</div>
                        <div className="process-image-container">
                            <img src="https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=2070&auto=format&fit=crop" alt="Door-to-Door Delivery" className="process-image" />
                        </div>
                        <h3>Door-to-Door Delivery</h3>
                        <p>Our professional couriers ensure safe delivery right to your doorstep with a smile</p>
                    </div>
                </div>
            </div>
        </section>

        <Footer />
        <Chatbot />
    </div>
  );
}
