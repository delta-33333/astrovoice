import {
  BRAND_GOLD,
  BRAND_SOFT,
  BRAND_STAR,
  LOCKUP,
  MARK_DOTS,
  MARK_LINE,
  SPARKLE_INNER,
  SPARKLE_OUTER,
  WORDMARK_D,
} from '@/lib/constellation-mark';

/**
 * Logo inline : constellation dorée en C, étoile à quatre branches,
 * wordmark CALLASTRAL (Cinzel, approche large) sur fond transparent.
 */
export default function CallastralLockup({ className = 'h-8 w-auto' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${LOCKUP.width} ${LOCKUP.height}`}
      className={className}
      role="img"
      aria-label="Callastral"
    >
      <svg x="0" y="0" width={LOCKUP.mark} height={LOCKUP.mark} viewBox="0 0 100 100" aria-hidden="true">
        <path
          d={MARK_LINE}
          fill="none"
          stroke={BRAND_GOLD}
          strokeOpacity={0.62}
          strokeWidth={0.48}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {MARK_DOTS.map((dot) => (
          <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={dot.r} fill={BRAND_SOFT} />
        ))}
        <path d={SPARKLE_OUTER} fill={BRAND_GOLD} />
        <path d={SPARKLE_INNER} fill={BRAND_STAR} />
      </svg>
      <path transform={`translate(${LOCKUP.textX} ${LOCKUP.baseline})`} fill={BRAND_GOLD} d={WORDMARK_D} />
    </svg>
  );
}
