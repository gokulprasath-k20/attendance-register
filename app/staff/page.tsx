import { redirect } from 'next/navigation';

export default function StaffPage() {
  redirect('/auth/staff/signin');
}
