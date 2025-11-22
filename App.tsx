
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TrackingForm from './components/TrackingForm';
import TrackingResult from './components/TrackingResult';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import type { TrackingData, TrackingEvent } from './types';
import { supabase } from './services/supabaseClient';

export default function App() {
  // Shipments map primarily for Admin usage to list all ID options
  const [shipments, setShipments] = useState<{ [key: string]: TrackingData }>({});
  
  // Single tracking result for the public user
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Real-time Subscription for Admin Dashboard and Live Tracking
  useEffect(() => {
    // 1. Fetch initial data if Admin
    if (isAdminLoggedIn) {
      fetchAllShipments();
    }

    // 2. Subscribe to changes
    // This allows real-time updates for both Admin (list view) and Users (single tracking view)
    const channel = supabase
      .channel('realtime:shipments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newRecord = payload.new as { tracking_number: string, data: TrackingData };
            
            // Update Admin List
            if (isAdminLoggedIn) {
                setShipments(prev => ({
                    ...prev,
                    [newRecord.tracking_number]: newRecord.data
                }));
            }

            // Update Public User View if they are currently looking at this specific ID
            setTrackingData(prev => {
                if (prev && prev.trackingNumber === newRecord.tracking_number) {
                    return newRecord.data;
                }
                return prev;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedRecord = payload.old as { tracking_number: string };
            
            // Remove from Admin List
             if (isAdminLoggedIn) {
                setShipments(prev => {
                    const newState = { ...prev };
                    delete newState[deletedRecord.tracking_number];
                    return newState;
                });
            }

            // Clear Public User View if they are looking at the deleted ID
            setTrackingData(prev => {
                if (prev && prev.trackingNumber === deletedRecord.tracking_number) {
                    return null;
                }
                return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdminLoggedIn]);

  const fetchAllShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*');
        
      if (error) {
        console.error('Error fetching shipments:', error);
        return;
      }

      if (data) {
        const shipmentMap: { [key: string]: TrackingData } = {};
        data.forEach((row: any) => {
           shipmentMap[row.tracking_number] = row.data;
        });
        setShipments(shipmentMap);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleTrack = async (trackingNumber: string) => {
    setIsLoading(true);
    setError(null);
    setTrackingData(null);

    const formattedNumber = trackingNumber.toUpperCase().trim();
    
    try {
        const { data, error } = await supabase
          .from('shipments')
          .select('data')
          .eq('tracking_number', formattedNumber)
          .single();

        if (error || !data) {
           setError('Tracking number not found. Please check details and try again.');
        } else {
           setTrackingData(data.data as TrackingData);
        }
    } catch (err) {
        setError('An unexpected error occurred while tracking. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCreateShipment = async (newShipment: TrackingData) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .insert([
          { 
            tracking_number: newShipment.trackingNumber, 
            data: newShipment 
          }
        ]);

      if (error) {
        alert('Error creating shipment: ' + error.message);
        return;
      }
      // No need to manually setShipments here, the Realtime subscription will catch it
    } catch (err) {
      console.error('Error creating shipment:', err);
      alert('Failed to create shipment.');
    }
  };

  const handleUpdateShipment = async (trackingNumber: string, event: TrackingEvent) => {
    const currentShipment = shipments[trackingNumber];
    if (!currentShipment) return;

    const updatedShipment = {
      ...currentShipment,
      currentStatus: event.status,
      history: [event, ...currentShipment.history]
    };

    try {
      const { error } = await supabase
        .from('shipments')
        .update({ data: updatedShipment })
        .eq('tracking_number', trackingNumber);

      if (error) {
        alert('Error updating shipment: ' + error.message);
        return;
      }
    } catch (err) {
      console.error('Error updating shipment:', err);
      alert('Failed to update shipment.');
    }
  };

  // NEW: Function to edit core details (Origin, Destination, etc.) without adding history
  const handleEditShipmentDetails = async (updatedData: TrackingData) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ data: updatedData })
        .eq('tracking_number', updatedData.trackingNumber);

      if (error) {
        alert('Error editing shipment: ' + error.message);
        return;
      }
    } catch (err) {
      console.error('Error editing shipment:', err);
      alert('Failed to edit shipment.');
    }
  };

  const handleDeleteShipment = async (trackingNumber: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('tracking_number', trackingNumber);

      if (error) {
        alert('Error deleting shipment: ' + error.message);
      }
    } catch (err) {
      console.error('Error deleting shipment:', err);
      alert('Failed to delete shipment.');
    }
  };

  return (
    <div className="content-wrapper">
        <Header />

        {isAdminLoggedIn && (
          <AdminDashboard 
            shipments={shipments}
            onCreateShipment={handleCreateShipment}
            onUpdateShipment={handleUpdateShipment}
            onEditShipment={handleEditShipmentDetails}
            onDeleteShipment={handleDeleteShipment}
            onLogout={() => setIsAdminLoggedIn(false)}
          />
        )}

        {/* Hero Section */}
        <section className="hero">
            <div className="hero-content">
                <h2>Track Your Parcel</h2>
                <p>Premium door-to-door delivery service across the globe. Your precious parcels, delivered with care and precision.</p>
                <div className="badges">
                    <div className="badge">
                        <div className="badge-dot blue"></div>
                        <span>Real-time Tracking</span>
                    </div>
                    <div className="badge">
                        <div className="badge-dot white"></div>
                        <span>Global Coverage</span>
                    </div>
                    <div className="badge">
                        <div className="badge-dot cyan"></div>
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
                    <p>Enter your tracking ID (starting with OM) to see real-time updates</p>
                    <TrackingForm 
                        onTrack={handleTrack} 
                        isLoading={isLoading} 
                        error={error}
                        onClearError={() => setError(null)}
                    />
                </div>

                {/* Result Area */}
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
                            <p className="text-sm text-blue-300/50 mt-3">Enter a tracking ID above to get started</p>
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
                            <img src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2000&auto=format&fit=crop" alt="Door-to-Door Delivery" className="process-image" />
                        </div>
                        <h3>Door-to-Door Delivery</h3>
                        <p>Our professional couriers ensure safe delivery right to your doorstep with a smile</p>
                    </div>
                </div>
            </div>
        </section>

        <Footer onLogin={() => setIsAdminLoggedIn(true)} />
        <Chatbot />
    </div>
  );
}
