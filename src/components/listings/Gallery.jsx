import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { FALLBACK_PHOTO } from '@/lib/listings';
import { cn } from '@/lib/utils';

export default function Gallery({ photos = [], title }) {
  const [index, setIndex] = useState(0);
  const images = photos.length ? photos : [{ file_url: FALLBACK_PHOTO, id: 'fallback' }];
  const active = images[Math.min(index, images.length - 1)];

  const move = (delta) => {
    setIndex((prev) => (prev + delta + images.length) % images.length);
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
        {active?.file_url ? (
          <img src={active.file_url} alt={title} className="aspect-[16/10] w-full object-cover sm:aspect-[16/9]" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="prev"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="next"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-primary/85 px-2.5 py-1 text-[11px] text-primary-foreground">
              {index + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {images.map((photo, photoIndex) => (
            <button
              key={photo.id || photo.file_url}
              type="button"
              onClick={() => setIndex(photoIndex)}
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                photoIndex === index ? 'border-primary' : 'border-transparent opacity-75 hover:opacity-100'
              )}
            >
              <img src={photo.file_url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}