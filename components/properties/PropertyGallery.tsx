'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface PropertyGalleryProps {
  property: Property;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ property }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Combine main image with additional images
  const allImages = [
    property.image_url,
    ...(property.images || [])
  ].filter(Boolean);

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
  };

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4 p-6">
        {/* Main Image Display */}
        <div className="relative group">
          <div className="aspect-[16/10] bg-gradient-to-br from-igudar-primary/10 to-igudar-primary/5 rounded-lg overflow-hidden">
            <img
              src={allImages[selectedImageIndex]}
              alt={`${property.title} - Image ${selectedImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
            
            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Fullscreen Button */}
              <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
                  <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                    <img
                      src={allImages[selectedImageIndex]}
                      alt={`${property.title} - Fullscreen`}
                      className="w-full h-full object-contain"
                      onError={handleImageError}
                    />
                    
                    {/* Fullscreen Navigation */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handlePrevious}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handleNext}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Close Button */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                      onClick={() => setIsFullscreen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-igudar-text">Gallery</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === selectedImageIndex
                      ? 'border-igudar-primary shadow-md'
                      : 'border-transparent hover:border-igudar-primary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${property.title} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Info */}
        <div className="flex items-center justify-between text-sm text-igudar-text-muted">
          <span>{allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}</span>
          <span>Click to view fullscreen</span>
        </div>
      </div>
    </Card>
  );
};