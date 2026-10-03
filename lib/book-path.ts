export function bookPath(slotId: string, startsAt: string, advisorId: string): string {
  const params = new URLSearchParams({
    slot: slotId,
    at: startsAt,
    advisor: advisorId,
  });
  return `/book?${params.toString()}`;
}
