'use client';

import Image from 'next/image';

const HERO_IMAGE = '/products/murda-moshari/hero-black.jpg';

/** Hero product shot — always visible (no clip/opacity reveal that can hide the image). */
export function HeroProductImage() {
  return (
    <div className="relative z-10 aspect-[4/3] w-full min-h-[220px] md:min-h-[300px]">
      <div className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-inner">
        <div className="relative h-full w-full">
          <Image
            src={HERO_IMAGE}
            alt="স্মার্ট মুর্দা মশারী — কালো রঙের পর্দা মশারী"
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain object-center"
          />
        </div>
      </div>
    </div>
  );
}
