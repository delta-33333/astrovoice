import AdvisorDirectory from '@/components/AdvisorDirectory';
import { listDirectoryAdvisors } from '@/lib/slots';

export const dynamic = 'force-dynamic';

export default async function AstrologersPage(props: { searchParams: Promise<{ dispo?: string }> }) {
  const params = await props.searchParams;
  const initialAvailability = params.dispo === 'now' ? 'now' : '';
  try {
    const result = await listDirectoryAdvisors();
    return (
      <AdvisorDirectory
        advisors={result.advisors}
        unavailable={result.unavailable}
        initialAvailability={initialAvailability}
      />
    );
  } catch {
    return <AdvisorDirectory advisors={[]} unavailable initialAvailability={initialAvailability} />;
  }
}
