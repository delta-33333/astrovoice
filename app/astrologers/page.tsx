import AdvisorDirectory from '@/components/AdvisorDirectory';
import { listPublicAdvisors } from '@/lib/astrologers';

export const dynamic = 'force-dynamic';

export default async function AstrologersPage() {
  try {
    const result = await listPublicAdvisors();
    return <AdvisorDirectory advisors={result.advisors} unavailable={result.unavailable} />;
  } catch {
    return <AdvisorDirectory advisors={[]} unavailable />;
  }
}
