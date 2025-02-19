import { useState, useEffect } from 'react';
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';
import Modal from './modal';
import useDeliveryDetails from '@framework/delivery-details/useDeliveryDetails';
import PurpleLogo from '@components/ui/purple-logo';

interface DeliveryAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeliveryAvailabilityModal: React.FC<DeliveryAvailabilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [canDeliver, setCanDeliver] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook
  const {
    maxDeliveryDistance,
    loading: loadingDeliveryDetails,
    error: deliveryDetailsError,
  } = useDeliveryDetails();

  const handleLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const handlePlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        setSelectedPlace(places[0]);
      }
    }
  };

  const handleCheckAvailability = async () => {
    if (!selectedPlace || !selectedPlace.formatted_address) {
      setError('Please select a valid location.');
      return;
    }

    if (maxDeliveryDistance === null) {
      setError('Delivery distance information is not available.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/distance?origin=${encodeURIComponent(
          selectedPlace.formatted_address
        )}`
      );
      const data = await response.json();

      if (response.ok) {
        const distanceInMiles = data.distanceValue / 1609.34;
        setDistance(distanceInMiles);
        setCanDeliver(distanceInMiles <= maxDeliveryDistance);
      } else {
        setError(data.error || 'Failed to calculate distance');
      }
    } catch (err) {
      console.error('Error fetching distance:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPlace(null);
    setDistance(null);
    setCanDeliver(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="py-6 max-w-lg mx-auto items-center sm:px-3">
        {' '}
        {/* Adds padding for small screens */}
        <div className="relative flex flex-col items-center mb-4">
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close Modal"
          >
            &times;
          </button>
          <PurpleLogo />
          <h2 className="text-xl font-semibold text-center mt-2">
            Check Delivery Availability
          </h2>
        </div>
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!}
          libraries={['places'] as const}
        >
          <StandaloneSearchBox
            onLoad={handleLoad}
            onPlacesChanged={handlePlacesChanged}
          >
            <input
              type="text"
              placeholder="Enter your location"
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </StandaloneSearchBox>
        </LoadScript>
        <button
          onClick={handleCheckAvailability}
          className="w-full bg-purple-900 text-white p-3 rounded mb-4 hover:bg-purple-800 transition-colors"
        >
          Check Availability
        </button>
        {(loading || loadingDeliveryDetails) && (
          <p className="text-gray-700 text-center">Calculating distance...</p>
        )}
        {(error || deliveryDetailsError) && (
          <p className="text-red-500 text-center">
            {error || deliveryDetailsError?.message}
          </p>
        )}
        {distance !== null && canDeliver !== null && (
          <div
            className={`mt-1 p-4 rounded ${
              canDeliver
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {/* <p>
              Your location is approximately{' '}
              <strong>{distance.toFixed(2)} miles</strong> away.
            </p> */}
            {canDeliver ? (
              <p>Good news! We can deliver to your location.</p>
            ) : (
              <p>Sorry, we cannot deliver to your location at this time.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeliveryAvailabilityModal;
