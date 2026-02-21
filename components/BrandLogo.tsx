import React from 'react';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  imageClassName = 'h-10 w-auto ',
  alt = 'Beleza Express'
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/brand-logo.png"
        alt={alt}
        className={imageClassName}
        onError={(event) => {
          const target = event.currentTarget;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'block';
        }}
      />
    </div>
  );
};

export default BrandLogo;
