import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AstrologersPage(props: { searchParams: Promise<{ dispo?: string }> }) {
  const params = await props.searchParams;
  const query = params.dispo ? `?dispo=${encodeURIComponent(params.dispo)}` : '';
  redirect(`/${query}`);
}
