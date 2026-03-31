import { redirect } from 'next/navigation';

export default async function AdminPage() {
  // Redirect to admin events page as the default admin view
  redirect('/admin/events');
}
