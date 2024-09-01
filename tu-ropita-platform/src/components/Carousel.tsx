import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CarouselItem {
  src: string;
  alt: string;
}

interface CarouselProps {
  items: CarouselItem[];
}

export function Carousel({ items }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) =>
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? items.length - 1 : prevIndex - 1
      );
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const getVisibleItems = () => {
    const visibleItems = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + items.length) % items.length;
      visibleItems.push({ ...items[index], position: i });
    }
    return visibleItems;
  };

  return (
    <div className="relative mb-8 overflow-hidden pb-16">
      <div className="flex justify-center items-center">
        <div className="flex -space-x-16">
          {getVisibleItems().map((item, index) => {
            let className = "relative transition-all duration-300 ease-in-out rounded-lg overflow-hidden ";
            if (item.position === 0) {
              className += "w-80 h-96 z-30 scale-100 opacity-100 shadow-2xl";
            } else if (Math.abs(item.position) === 1) {
              className += "w-64 h-80 scale-90 opacity-85 z-20 shadow-xl";
            } else {
              className += "w-48 h-64 scale-75 opacity-70 z-10 shadow-lg";
            }
            return (
              <div 
                key={index} 
                className={className}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-2">
        {items.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="bottom-0 left-0 right-0 flex justify-center items-center space-x-2 py-2">
        <Button size="icon" variant="ghost" className="z-40" onClick={prevSlide}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button size="icon" variant="ghost" className="z-40" onClick={nextSlide}>
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}