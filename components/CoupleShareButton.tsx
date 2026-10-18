'use client';

export default function CoupleShareButton({ url, label }: { url: string; label: string }) {
  return (
    <button
      type="button"
      className="btn-secondary mt-4"
      onClick={() => {
        const absolute = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        const shareUrl = absolute.includes('utm_source=') ? absolute : `${absolute}${absolute.includes('?') ? '&' : '?'}utm_source=couple_share`;
        if (typeof navigator.share === 'function') {
          void navigator.share({ url: shareUrl }).catch(() => undefined);
          return;
        }
        void navigator.clipboard?.writeText(shareUrl);
      }}
    >
      {label}
    </button>
  );
}
