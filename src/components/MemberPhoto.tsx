import React, { useEffect, useState } from 'react';
import { getMemberPhotoUrl } from '../lib/supabaseService';

interface MemberPhotoProps {
  photoUrl?: string;
  initials: string;
  size?: number;
  className?: string;
}

/** Shows a member's optional photo, falling back to their initials. */
export const MemberPhoto: React.FC<MemberPhotoProps> = ({ photoUrl, initials, size = 40, className = '' }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!photoUrl) {
      setUrl(null);
      return;
    }
    getMemberPhotoUrl(photoUrl).then((resolved) => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [photoUrl]);

  const style = { width: size, height: size };

  if (url) {
    return (
      <img
        src={url}
        alt={`Photo of ${initials}`}
        loading="lazy"
        style={style}
        className={`rounded-xl object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-xl bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
};
