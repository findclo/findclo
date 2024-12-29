import Image from "next/image"
import Link from "next/link"
import { CarouselItem as CarouselItemType } from "../../hooks/useCarousel"

interface CarouselItemProps {
  item: CarouselItemType & { position?: number }
  isClient: boolean
}

export function CarouselItem({ item, isClient }: CarouselItemProps) {
  let className = "relative transition-all duration-300 ease-in-out rounded-lg overflow-hidden "

  if (!isClient || item.position === 0) {
    className += "w-48 h-64 sm:w-64 sm:h-80 md:w-80 md:h-96 z-30 scale-100 opacity-100 shadow-2xl"
  } else if (Math.abs(item.position!) === 1) {
    className += "w-40 h-56 sm:w-52 sm:h-68 md:w-64 md:h-80 scale-90 opacity-85 z-20 shadow-xl"
  } else {
    className += "w-32 h-48 sm:w-40 sm:h-56 md:w-48 md:h-64 scale-75 opacity-70 z-10 shadow-lg"
  }

  return (
    <Link 
      href={`/product/${item.id}`}
      className={`${className} hover:scale-100 hover:shadow-2xl hover:z-40 hover:opacity-100 transition-all duration-300`}
    >
      <Image
        src={item.src}
        alt={item.alt}
        layout="fill"
        objectFit="cover"
        className="rounded-lg"
      />
    </Link>
  )
}

