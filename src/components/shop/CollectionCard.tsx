import Image from 'next/image';
import Link from 'next/link';
import type { ShopCollection } from '@/types/shop';

interface CollectionCardProps {
  collection: ShopCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group block overflow-hidden rounded-sm border border-alma-border bg-white hover:border-alma-ink/25 transition-colors"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-alma-cream">
        <Image
          src={collection.imageUrl}
          alt={collection.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-display text-base sm:text-lg text-alma-ink">{collection.name}</h3>
        <p className="text-xs sm:text-sm text-alma-muted mt-0.5 line-clamp-1">{collection.description}</p>
        <p className="text-xs text-alma-gold font-medium mt-2">{collection.productCount} products</p>
      </div>
    </Link>
  );
}
