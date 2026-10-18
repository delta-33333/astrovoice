'use client';

export default function CoupleShareButton({
  url,
  label,
  title,
  text,
}: {
  url: string;
  label: string;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      className="btn-secondary mt-4"
      onClick={() => {
        const absolute = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        const shareUrl = absolute.includes('utm_source=') ? absolute : `${absolute}${absolute.includes('?') ? '&' : '?'}utm_source=couple_share`;
        if (typeof navigator.share === 'function') {
          void navigator.share({ url: shareUrl, title, text }).catch(() => undefined);
          return;
        }
        void navigator.clipboard?.writeText(shareUrl);
      }}
    >
      {label}
    </button>
  );
}
