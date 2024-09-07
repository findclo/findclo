"use client";

import { Carousel } from "@/components/Carousel";
import { FeaturedBrands } from "@/components/FeaturedBrands";
import { SearchBar } from "@/components/SearchBar";

const carouselItems = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFja2V0fGVufDB8fDB8fHww",
    alt: "Jacket",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlYXRzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
    alt: "Person wearing sweatshirt",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dCUyMHNoaXJ0fGVufDB8fDB8fHww",
    alt: "White T-shirt",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bGVhdGhlciUyMHBhbnRzfGVufDB8fDB8fHww",
    alt: "Jeans",
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZHJlc3N8ZW58MHx8MHx8fDA%3D",
    alt: "Elegant dress",
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2hvZXN8ZW58MHx8MHx8fDA%3D",
    alt: "Stylish shoes",
  },
  {
    id: "7",
    src: "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VpdHxlbnwwfHwwfHx8MA%3D%3D",
    alt: "Business suit",
  },
];

export default function Home() {
  return (
    <>
      <SearchBar />
      
      <div className="flex justify-center">
        <Carousel items={carouselItems} />
      </div>
      
      <div className="flex justify-center">
        <FeaturedBrands />
      </div>
    </>
  );
}