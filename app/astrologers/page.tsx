import AdvisorDirectory from '@/components/AdvisorDirectory';
import { listDirectoryAdvisors } from '@/lib/slots';

export const dynamic = 'force-dynamic';

export default async function AstrologersPage() {
  try {
    const result = await listDirectoryAdvisors();
    return <AdvisorDirectory advisors={result.advisors} unavailable={result.unavailable} />;
  } catch {
    return <AdvisorDirectory advisors={[]} unavailable />;
  }
}
