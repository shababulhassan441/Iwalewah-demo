import React, { useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';

interface UserMapData {
  lat: number;
  lng: number;
}

interface Props {
  lat: number;
  lng: number;
  height: string;
  zoom?: number;
  showInfoWindow?: boolean;
  children?: any;
  formatted_address?: string;
  mapAddressFiled?: any;
  mapCurrentPosition?: any;
}

const Map: React.FC<Props> = ({
  lat,
  lng,
  height,
  zoom,
  showInfoWindow,
  mapCurrentPosition,
}) => {
  const containerStyle = {
    width: '100%',
    height: height || '420px',
  };

  const center = {
    lat: lat || 1.295831,
    lng: lng || 103.76261,
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: `${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
  });

  const [selectedMarker, setSelectedMarker] = useState<any>();
  const [mapPosition, setMapPosition] = useState<UserMapData | null>(null);
  const [infoWindowToggle, setInfoWindowToggle] = useState<boolean>(false);

  const onMarkerDragEnd = (e: any) => {
    if (e.domEvent.type === 'click') {
      setInfoWindowToggle(true);
    }
    const geocoder = new (window as any).google.maps.Geocoder();
    const latLng = {
      lat: parseFloat(e.latLng.lat()),
      lng: parseFloat(e.latLng.lng()),
    };
    geocoder
      .geocode({ location: latLng })
      .then((response: any) => {
        if (response.results[0]) {
          if (mapCurrentPosition !== undefined) {
            mapCurrentPosition(response.results[0]?.formatted_address);
          }
          setSelectedMarker(response.results[0]);
          setMapPosition(latLng);
          setInfoWindowToggle(true);
        } else {
          window.alert('No results found');
        }
      })
      .catch((e: any) => window.alert('Geocoder failed due to: ' + e));
  };

  // Cast GoogleMap as 'any' to bypass the type issue
  const GoogleMapComponent = GoogleMap as any;
  const MarkerComponent = Marker as any;
  const InfoWindowComponent = InfoWindow as any;
  return isLoaded ? (
    <>
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={mapPosition || center}
        zoom={zoom || 15}
      >
        <MarkerComponent
          position={mapPosition || center}
          draggable={true}
          visible={true}
          icon={'/assets/images/pin.png'}
          onDragEnd={(e:any) => onMarkerDragEnd(e)}
          onClick={(e :any) => onMarkerDragEnd(e)}
        >
          {showInfoWindow && infoWindowToggle && (
            <InfoWindowComponent
              position={mapPosition || center}
              onCloseClick={() => setInfoWindowToggle(false)}
            >
              <p>{selectedMarker?.formatted_address}</p>
            </InfoWindowComponent>
          )}
        </MarkerComponent>
      </GoogleMapComponent>
    </>
  ) : (
    <div>Loading....</div>
  );
};

export default React.memo(Map);
