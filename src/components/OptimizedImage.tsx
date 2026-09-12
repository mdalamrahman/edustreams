import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string; // Enforced strict non-optional alt attribute
  webpSrc?: string;
  fallbackSrc?: string;
  className?: string;
  aspectRatio?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  fallbackSrc = '/favicon.svg',
  className = '',
  aspectRatio,
  loading = 'lazy',
  decoding = 'async',
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Derive auto WebP path if available
  const autoWebp = webpSrc || (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg')
    ? src.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    : undefined);

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton Shimmer while loading */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </div>
      )}

      <picture>
        {autoWebp && (
          <source srcSet={autoWebp} type="image/webp" />
        )}
        <img
          src={hasError ? fallbackSrc : src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...rest}
        />
      </picture>
    </div>
  );
};
