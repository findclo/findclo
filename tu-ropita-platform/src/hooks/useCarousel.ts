import { useEffect, useState } from 'react'

export interface CarouselItem {
  id: string
  src: string
  alt: string
}

export function useCarousel(items: CarouselItem[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, 3000 + Math.random() * 1000) // Random interval between 3-4 seconds

    return () => clearInterval(interval)
  }, [items.length])

  const getVisibleItems = () => {
    if (!isClient) return items.slice(0, Math.min(5, items.length))
    
    const visibleItems = []
    const itemCount = items.length
    const maxVisibleItems = Math.min(5, itemCount)
    const offset = Math.floor(maxVisibleItems / 2)

    for (let i = -offset; i <= offset; i++) {
      const index = (currentIndex + i + itemCount) % itemCount
      visibleItems.push({ ...items[index], position: i })
    }

    return visibleItems
  }

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % items.length)
  const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)

  return {
    currentIndex,
    isClient,
    getVisibleItems,
    goToNext,
    goToPrevious,
  }
}

