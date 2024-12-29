'use client'

import { Button } from "@/components/ui/button"
import { CarouselItem } from "@/components/ui/CarouselItem"
import { CarouselItem as CarouselItemType, useCarousel } from "@/hooks/useCarousel"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps {
  items: CarouselItemType[]
}

export function Carousel({ items }: CarouselProps) {
  const { currentIndex, isClient, getVisibleItems, goToNext, goToPrevious } = useCarousel(items)

  const visibleItems = getVisibleItems()

  return (
    <div className="relative overflow-hidden mt-8 pb-16">
      <div className="flex justify-center items-center">
        <div className={`flex ${items.length <= 2 ? 'space-x-4' : '-space-x-8 sm:-space-x-12 md:-space-x-16'}`}>
          {visibleItems.map((item, index) => (
            <CarouselItem key={index} item={item} isClient={isClient} />
          ))}
        </div>
      </div>

      {isClient && (
        <>
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
            <Button size="icon" variant="ghost" className="z-40" onClick={goToPrevious}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button size="icon" variant="ghost" className="z-40" onClick={goToNext}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

