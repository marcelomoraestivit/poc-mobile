import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackEmoji?: string;
}

export default function ProductImage({ src, alt, className, fallbackEmoji = '🛍️' }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    console.error('Failed to load image:', src);
    setImageError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', src);
    setLoading(false);
  };

  if (imageError) {
    // Generate SVG placeholder with grayscale and emoji
    const svgDataUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e0e0e0' /%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='120' fill='%23757575'%3E${fallbackEmoji}%3C/text%3E%3C/svg%3E`;

    return (
      <img
        src={svgDataUrl}
        alt={alt}
        className={className}
        style={{ backgroundColor: '#ffffff' }}
      />
    );
  }

  return (
    <>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#757575',
          }}
        >
          ⋯
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: loading ? 'none' : 'block' }}
        crossOrigin="anonymous"
      />
    </>
  );
}
