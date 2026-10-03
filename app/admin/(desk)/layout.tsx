import AdminNav from '@/components/AdminNav';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
