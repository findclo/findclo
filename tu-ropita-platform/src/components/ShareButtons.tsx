'use client';

import { useState } from 'react';
import { FaFacebookF, FaLink, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface ShareButtonsProps {
  productId: string;
  productName: string;
}

export default function ShareButtons({ productId, productName }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

// TODO: Change this to the actual website URL
  const shareUrl = `https://e942-190-31-49-239.ngrok-free.app/product/${productId}`;
  const shareText = `Check out this ${productName}!`;

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={shareOnFacebook} className="text-gray-700 hover:text-black p-2 rounded-full border border-gray-300 hover:border-gray-500">
        <FaFacebookF size={16} />
      </button>
      <button onClick={shareOnTwitter} className="text-gray-700 hover:text-black p-2 rounded-full border border-gray-300 hover:border-gray-500">
        <FaXTwitter size={16} />
      </button>
      <button onClick={shareOnWhatsApp} className="text-gray-700 hover:text-black p-2 rounded-full border border-gray-300 hover:border-gray-500">
        <FaWhatsapp size={16} />
      </button>
      <button onClick={copyLink} className="text-gray-700 hover:text-black p-2 rounded-full border border-gray-300 hover:border-gray-500">
        {copied ? <FaLink size={16} className="text-green-500" /> : <FaLink size={16} />}
      </button>
    </div>
  );
}