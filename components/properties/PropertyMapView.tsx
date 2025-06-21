'use client';

import React from 'react';
import { Property } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Globe } from 'lucide-react';

interface PropertyMapViewProps {
  property: Property;
}

export const PropertyMapView: React.FC<PropertyMapViewProps> = ({ property }) => {
  const getMapUrl = () => {
    const query = encodeURIComponent(`${property.city}`);
    return `https://www.openstreetmap.org/export/embed.html?bbox=-8.0,31.0,-1.0,36.0&layer=mapnik&marker=${query}&zoom=12`;
  };

  const getGoogleMapsUrl = () => {
    const query = encodeURIComponent(`${property.location}, ${property.city}, ${property.region}, Morocco`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-igudar-text">
          <MapPin className="mr-2 h-5 w-5" />
          Location & Map
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-igudar-text-secondary">Address</span>
            <span className="font-medium text-igudar-text">{property.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-igudar-text-secondary">City</span>
            <span className="font-medium text-igudar-text">{property.city}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-igudar-text-secondary">Region</span>
            <span className="font-medium text-igudar-text">{property.region}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-igudar-text">Map Preview</h4>
          <div className="relative bg-gradient-to-br from-igudar-primary/10 to-igudar-primary/5 rounded-lg overflow-hidden border border-border">
            <iframe
              src={getMapUrl()}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
              title={`Map of ${property.title}`}
            />
            
            {/* Map Overlay with Location Info */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-igudar-primary" />
                <div>
                  <div className="font-medium text-sm text-igudar-text">{property.city}</div>
                  <div className="text-xs text-igudar-text-muted">{property.region}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Actions */}
        <div className="flex flex-wrap gap-2">
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-igudar-primary bg-igudar-primary/10 hover:bg-igudar-primary/20 rounded-lg transition-colors"
          >
            <Globe className="mr-2 h-4 w-4" />
            View on Google Maps
          </a>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    const directionsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${encodeURIComponent(`${property.location}, ${property.city}, ${property.region}, Morocco`)}`;
                    window.open(directionsUrl, '_blank');
                  },
                  (error) => {
                    console.error('Error getting location:', error);
                    // Fallback to just opening the location
                    window.open(getGoogleMapsUrl(), '_blank');
                  }
                );
              } else {
                window.open(getGoogleMapsUrl(), '_blank');
              }
            }}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
          >
            <Navigation className="mr-2 h-4 w-4" />
            Get Directions
          </button>
        </div>

        {/* Location Highlights */}
        {property.nearby_facilities && property.nearby_facilities.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-igudar-text">Nearby Landmarks</h4>
            <div className="flex flex-wrap gap-2">
              {property.nearby_facilities.slice(0, 6).map((facility, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
