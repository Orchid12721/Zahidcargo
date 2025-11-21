
import React, { useState } from 'react';

interface TrackingFormProps {
  onTrack: (trackingNumber: string) => void;
  isLoading: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export default function TrackingForm({ onTrack, isLoading, error, onClearError }: TrackingFormProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingNumber(e.target.value);
    // Clear errors when user starts typing
    if (localError) setLocalError(null);
    if (error && onClearError) onClearError();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = trackingNumber.trim().toUpperCase();

    if (!trimmedInput) {
        setLocalError("Please enter a tracking number.");
        return;
    }

    if (!trimmedInput.startsWith('OM')) {
        setLocalError("Invalid format. Tracking number must start with 'OM'.");
        return;
    }

    const numberPart = trimmedInput.slice(2);

    if (!/^\d+$/.test(numberPart)) {
         setLocalError("Invalid format. Tracking number must contain only numbers after 'OM'.");
         return;
    }

    if (numberPart.length !== 9) {
        setLocalError(`Invalid length. Expected 9 digits after 'OM', but found ${numberPart.length}.`);
        return;
    }

    onTrack(trimmedInput);
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-[36rem] mx-auto">
      <form className="search-form" onSubmit={handleSubmit}>
          <input 
              type="text" 
              id="trackingInput"
              className={`search-input ${displayError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : ''}`}
              placeholder="e.g., OM123456789"
              aria-label="Package Tracking ID"
              aria-invalid={!!displayError}
              aria-describedby={displayError ? "tracking-error" : undefined}
              value={trackingNumber}
              onChange={handleChange}
              disabled={isLoading}
              maxLength={11}
          />
          <button 
            type="submit" 
            className={`search-button ${isLoading ? 'opacity-80 cursor-wait' : ''}`} 
            disabled={isLoading}
          >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                </div>
              ) : (
                <span>Track Package</span>
              )}
          </button>
      </form>
      {displayError && (
          <p id="tracking-error" className="mt-3 text-red-400 text-sm font-semibold text-center animate-pulse">
              {displayError}
          </p>
      )}
    </div>
  );
}
