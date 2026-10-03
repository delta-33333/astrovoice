import type { PublicAdvisor } from '@/lib/types';

function hueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

const SIZES = {
  sm: 'h-14 w-14 text-lg',
  md: 'h-20 w-20 text-2xl',
  lg: 'h-28 w-28 text-4xl',
  xl: 'h-40 w-40 text-5xl',
  call: 'h-48 w-48 text-6xl',
} as const;

export default function AdvisorAvatar({
  advisor,
  size = 'md',
}: {
  advisor: Pick<PublicAdvisor, 'name' | 'firstName' | 'lastName' | 'photoUrl'>;
  size?: keyof typeof SIZES;
}) {
  const initials = `${advisor.firstName.charAt(0)}${advisor.lastName.charAt(0)}`.toUpperCase();

  if (advisor.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={advisor.photoUrl}
        alt=""
        className={`${SIZES[size]} rounded-full object-cover border border-white/15`}
      />
    );
  }

  const hue = hueFromName(advisor.name);
  return (
    <div
      aria-hidden="true"
      className={`advisor-avatar-fallback ${SIZES[size]} rounded-full grid place-items-center font-[family-name:var(--font-cinzel)] text-white border border-white/15`}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 42% 32%), hsl(${(hue + 40) % 360} 45% 18%), #d4af37)`,
      }}
    >
      {initials}
    </div>
  );
}
