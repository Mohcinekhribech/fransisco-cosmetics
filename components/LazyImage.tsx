import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  skeletonClassName = '',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  if (!src || src.trim() === '') {
    return (
      <span className={`relative block bg-brand-nude/60 ${skeletonClassName}`}>
        <span className="absolute inset-0 flex items-center justify-center text-brand-charcoal/30 text-xs">
          No image
        </span>
      </span>
    );
  }

  return (
    <span className="relative block">
      {!loaded && (
        <span
          className={`absolute inset-0 bg-brand-nude/60 animate-pulse rounded-2xl ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </span>
  );
};

export default LazyImage;
