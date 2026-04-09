import React, { useRef, useState, useEffect } from 'react';
// @ts-ignore
import ColorThief from 'colorthief';
import { Upload, X, Camera } from 'lucide-react';
import { format } from 'date-fns';

interface HeroSectionProps {
  imageUrl: string;
  currentMonth: Date;
  hasCustomImage: boolean;
  onColorsExtracted: (colors: { primary: string; secondary: string }) => void;
  onUpload: (file: File) => void;
  onRemoveCustom: () => void;
}

export default function HeroSection({
  imageUrl, currentMonth, hasCustomImage, onColorsExtracted, onUpload, onRemoveCustom
}: HeroSectionProps) {
  const [displayedUrl, setDisplayedUrl]   = useState(imageUrl);
  const [incomingUrl, setIncomingUrl]     = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isDragging, setIsDragging]       = useState(false);
  const incomingRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imageUrl === displayedUrl) return;
    setIncomingUrl(imageUrl);
    setTransitioning(false);
  }, [imageUrl]);

  const extractColor = (img: HTMLImageElement) => {
    try {
      // @ts-ignore
      const ct = new ColorThief();
      const [r, g, b] = ct.getColor(img);
      onColorsExtracted({
        primary:   `rgb(${r},${g},${b})`,
        secondary: `rgba(${r},${g},${b},0.15)`,
      });
    } catch { /* ignore */ }
  };

  const handleIncomingLoad = () => {
    requestAnimationFrame(() => setTransitioning(true));
    if (incomingRef.current) extractColor(incomingRef.current);
    setTimeout(() => {
      setDisplayedUrl(imageUrl);
      setIncomingUrl(null);
      setTransitioning(false);
    }, 700);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) onUpload(file);
  };

  const monthName  = format(currentMonth, 'MMMM');
  const monthYear  = format(currentMonth, 'yyyy');

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-slate-900 group"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Base image */}
      <img
        src={displayedUrl}
        alt="Calendar Theme"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Incoming cross-fade image */}
      {incomingUrl && (
        <img
          ref={incomingRef}
          crossOrigin="anonymous"
          src={incomingUrl}
          alt="Next Theme"
          onLoad={handleIncomingLoad}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: transitioning ? 1 : 0 }}
        />
      )}

      {/* Drag-to-drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 border-4 border-dashed border-white/60 rounded-lg m-3">
          <Camera className="w-10 h-10 text-white" />
          <p className="text-white font-semibold text-sm">Drop image here</p>
        </div>
      )}

      {/* Rich multi-stop gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

      {/* Month name watermark — bottom left, beautiful display font */}
      <div className="absolute bottom-0 left-0 p-4 sm:p-5 md:p-6">
        <p
          className="font-display text-white/90 leading-none tracking-tight drop-shadow-lg"
          style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.8rem)',
            fontWeight: 700,
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}
        >
          {monthName}
        </p>
        <p
          className="text-white/50 font-light tracking-[0.2em] uppercase mt-0.5"
          style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)' }}
        >
          {monthYear}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload button — hover-reveal on desktop, always on mobile */}
      <button
        onClick={() => fileInputRef.current?.click()}
        title="Upload photo for this month"
        className="
          absolute top-3 right-3
          flex items-center gap-1.5
          bg-black/40 hover:bg-black/65 text-white
          backdrop-blur-md rounded-full
          px-2.5 py-1.5
          text-xs font-semibold
          border border-white/20 hover:border-white/40
          transition-all duration-200
          shadow-lg
          md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0
          active:scale-95
        "
      >
        <Upload className="w-3 h-3 flex-shrink-0" />
        <span className="hidden sm:inline">Upload</span>
      </button>

      {/* Reset custom image — top left, only when custom */}
      {hasCustomImage && (
        <button
          onClick={onRemoveCustom}
          title="Restore default photo"
          className="
            absolute top-3 left-3
            flex items-center gap-1
            bg-black/40 hover:bg-red-500/80 text-white
            backdrop-blur-md rounded-full
            px-2 py-1.5
            text-xs font-semibold
            border border-white/20 hover:border-red-400/50
            transition-all duration-200
            shadow-md
            md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0
            active:scale-95
          "
        >
          <X className="w-3 h-3" />
          <span className="hidden sm:inline text-xs">Reset</span>
        </button>
      )}

      {/* Custom badge */}
      {hasCustomImage && (
        <span className="absolute bottom-14 sm:bottom-16 left-4 sm:left-5 text-[9px] font-bold uppercase tracking-widest text-white/60 bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
          Custom
        </span>
      )}
    </div>
  );
}
