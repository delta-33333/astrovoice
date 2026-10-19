import {
  OFFICIAL_SOCIAL_PROFILES,
  socialLinkLabel,
  socialNavLabel,
  type SocialId,
} from '@/lib/social';

function SocialIcon({ id }: { id: SocialId }) {
  const common = {
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
    className: 'h-5 w-5',
    fill: 'currentColor',
  };
  if (id === 'youtube') {
    return (
      <svg {...common}>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.57V8.43L15.84 12l-6.09 3.57z" />
      </svg>
    );
  }
  if (id === 'tiktok') {
    return (
      <svg {...common}>
        <path d="M14.4 3.2c.4 2.5 1.8 4.3 4.2 4.7v2.6a7.4 7.4 0 0 1-4.2-1.4v6.3a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.7a3.2 3.2 0 1 0 2.3 3.1V3.2h2.6z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 1.8H7A2.2 2.2 0 0 0 4.8 7v10A2.2 2.2 0 0 0 7 19.2h10a2.2 2.2 0 0 0 2.2-2.2V7A2.2 2.2 0 0 0 17 4.8zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.8A2 2 0 1 0 14 12a2 2 0 0 0-2-2zm5.35-2.95a1.05 1.05 0 1 1-1.05 1.05 1.05 1.05 0 0 1 1.05-1.05z" />
    </svg>
  );
}

export default function SocialProfiles({ locale }: { locale: string }) {
  return (
    <nav aria-label={socialNavLabel(locale)} className="mt-4 flex gap-2">
      {OFFICIAL_SOCIAL_PROFILES.map((profile) => (
        <a
          key={profile.id}
          href={profile.href}
          rel="me noopener"
          target="_blank"
          title={profile.name}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celestial-gold"
        >
          <SocialIcon id={profile.id} />
          <span className="sr-only">{socialLinkLabel(locale, profile.name)}</span>
        </a>
      ))}
    </nav>
  );
}
