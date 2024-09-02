'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFullScreen) {
        switch (event.key.toLowerCase()) {
          case 'arrowleft':
          case 'a':
            prevImage();
            break;
          case 'arrowright':
          case 'd':
            nextImage();
            break;
          case 'escape':
            setIsFullScreen(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const setMainImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div>
      <div className="bg-gray-200 aspect-square relative mb-4 rounded-lg overflow-hidden" onClick={toggleFullScreen}>
        <Image
          src={images[currentImageIndex]}
          alt={`${productName} ${currentImageIndex + 1}`}
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, index) => (
          <div 
            key={index}
            className={`w-20 h-20 relative cursor-pointer rounded-md overflow-hidden ${index === currentImageIndex ? 'border-2 border-black' : ''}`}
            onClick={() => setMainImage(index)}
          >
            <Image
              src={img}
              alt={`${productName} ${index + 1}`}
              layout="fill"
              objectFit="cover"
            />
          </div>
        ))}
      </div>

      {isFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={images[currentImageIndex]}
              alt={`${productName} ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="contain"
            />
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-4 rounded-full text-3xl"
              onClick={prevImage}
            >
              &#8249;
            </button>
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-4 rounded-full text-3xl"
              onClick={nextImage}
            >
              &#8250;
            </button>
            <button 
              className="absolute top-4 right-4 bg-white bg-opacity-50 p-2 rounded-full"
              onClick={toggleFullScreen}
            >
              &#10005;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}