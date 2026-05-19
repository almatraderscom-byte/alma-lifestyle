'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ShopCollection } from '@/types/shop';
import { EASE_LUXURY, DURATION } from '@/lib/motion';

interface CollectionCardProps {
  collection: ShopCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: DURATION.normal, ease: EASE_LUXURY }}
    >
      <Link
        href={`/collections/${collection.slug}`}
        className="group block relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]"
      >
        <Image
          src={collection.imageUrl}
          alt={collection.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-alma-obsidian/85 via-alma-obsidian/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-alma-cream">
          <p className="text-[10px] uppercase tracking-[0.18em] text-alma-gold-light mb-1">
            Collection
          </p>
          <h3 className="font-display text-lg sm:text-xl leading-tight">{collection.name}</h3>
          <p className="text-xs text-alma-cream/75 mt-1 line-clamp-1">{collection.description}</p>
          <p className="text-[11px] tracking-wider text-alma-gold-light mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
            {collection.productCount} pieces — Shop now
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
