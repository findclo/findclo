'use client';

import { ShoppingCart } from 'lucide-react';
import {publicMetricsApiWrapper} from "@/api-wrappers/metrics";

interface ClientButtonProps {
    productId: string;
    productUrl: string;
}

const BuyButton: React.FC<ClientButtonProps> = ({ productId, productUrl }) => {
    const handleClick = async () => {
        await publicMetricsApiWrapper.addClickBrandInteraction(productId);

        window.location.href = productUrl;
    };

    return (
        <button
            onClick={handleClick}
            className="w-full bg-black text-white py-3 px-4 rounded mb-4 flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-green-600 hover:scale-105 hover:shadow-lg"
        >
            <ShoppingCart className="mr-2 transition-transform duration-300 ease-in-out group-hover:rotate-12" size={20} />
            Comprar
        </button>
    );
};

export default BuyButton;
