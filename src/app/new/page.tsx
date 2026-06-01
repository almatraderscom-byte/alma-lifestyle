import { redirect } from 'next/navigation';

/** Alias for newest products — same as header "নতুন". */
export default function NewArrivalsPage() {
  redirect('/products?sort=newest');
}
