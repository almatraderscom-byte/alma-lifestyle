import Link from 'next/link';

interface AdminCustomerLinkProps {
  href: string;
  label?: string;
  className?: string;
}

/** Opens customer-facing URL in a new tab (with optional cache-bust query). */
export function AdminCustomerLink({
  href,
  label = 'View on customer site →',
  className = 'text-sm font-medium text-[var(--ob-violet)] hover:underline inline-flex items-center gap-1',
}: AdminCustomerLinkProps) {
  const url = href.includes('?') ? `${href}&_=${Date.now()}` : `${href}?_=${Date.now()}`;

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </Link>
  );
}
