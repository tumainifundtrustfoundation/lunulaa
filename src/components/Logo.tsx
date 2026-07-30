import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import logoImg from '../assets/images/lupanulla_logo_1783623714916.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const imgSizeClasses = {
    sm: 'h-[40px] w-auto rounded-lg',
    md: 'h-[50px] md:h-[60px] w-auto rounded-xl',
    lg: 'h-[70px] md:h-[80px] w-auto rounded-2xl'
  };

  const svgSizeClasses = {
    sm: 'w-10 h-10 rounded-lg',
    md: 'w-12 h-12 md:w-14 md:h-14 rounded-xl',
    lg: 'w-16 h-16 md:w-20 md:h-20 rounded-2xl'
  };

  const svgPadding = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3.5'
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 32
  };

  if (!imgError) {
    return (
      <img
        src={logoImg}
        alt="Lupanulla Elimu Hub Logo"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${imgSizeClasses[size]} object-contain shadow-md border border-slate-200/50 ${className}`}
      />
    );
  }

  // Beautiful SVG Fallback when image fails to load - Styled to match the new official logo
  return (
    <div 
      className={`${svgSizeClasses[size]} ${svgPadding[size]} bg-white shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-green-600/5" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-baseline font-black leading-none tracking-tighter">
          <span className="text-blue-900" style={{ fontSize: iconSizes[size] * 1.2 }}>L</span>
          <span className="text-green-600" style={{ fontSize: iconSizes[size] * 1.2 }}>N</span>
        </div>
        <GraduationCap 
          size={iconSizes[size] * 0.6} 
          className="text-blue-900 mt-[-2px] transition-transform duration-300 group-hover:scale-110" 
        />
      </div>
      
      {/* Subtle background detail */}
      <div className="absolute -bottom-1 -right-1 w-2/3 h-2/3 bg-green-500/10 rounded-full blur-md" />
    </div>
  );
}

