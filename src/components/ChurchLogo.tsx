import React, { useState } from 'react';

interface ChurchLogoProps {
    className?: string;
    imgClassName?: string;
    alt?: string;
    fallbackText?: string;
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
    className = 'w-10 h-10 rounded-xl overflow-hidden shadow-sm',
    imgClassName = 'w-full h-full object-cover',
    alt = 'GCYC Church Logo',
    fallbackText = 'GCYC',
}) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className={`${className} bg-blue-700 text-white font-headline font-black flex items-center justify-center text-xs tracking-wider shadow-sm shadow-blue-700/20`}>
                {fallbackText}
            </div>
        );
    }

    return (
        <div className={className}>
            <img
                src="/church-logo.png"
                alt={alt}
                onError={() => setHasError(true)}
                className={imgClassName}
            />
        </div>
    );
};
