/** Table ou colonne absente : le déploiement peut précéder la migration. */
export function isMissingRelation(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const message = error.message || '';
  return (
    error.code === '42P01' ||
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    error.code === 'PGRST205' ||
    /does not exist|schema cache|Could not find the table|Could not find the /i.test(message)
  );
}
