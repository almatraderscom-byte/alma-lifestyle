import { redirect } from 'next/navigation';

/** Legacy mock catalog — send shoppers to the live product listing. */
export default function CollectionsPage() {
  redirect('/products');
}
