'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADVISOR_LANGS, CURRENCIES, type AdvisorLang, type Currency } from '@/lib/money';

const LANG_LABELS: Record<AdvisorLang, string> = {
  fr: 'FR',
  en: 'EN',
  es: 'ES',
  de: 'DE',
  it: 'IT',
};

export default function MarketSwitch({
  language,
  currency,
}: {
  language: AdvisorLang;
  currency: Currency;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const save = async (nextLanguage: string, nextCurrency: string) => {
    setPending(true);
    try {
      await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: nextLanguage, currency: nextCurrency }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <select
        aria-label="Langue des conseillers"
        value={language}
        disabled={pending}
        onChange={(event) => void save(event.target.value, currency)}
        className="rounded-lg bg-white/10 border border-white/15 px-1.5 py-1 text-xs text-white"
      >
        {ADVISOR_LANGS.map((code) => (
          <option key={code} value={code}>{LANG_LABELS[code]}</option>
        ))}
      </select>
      <select
        aria-label="Devise"
        value={currency}
        disabled={pending}
        onChange={(event) => void save(language, event.target.value)}
        className="rounded-lg bg-white/10 border border-white/15 px-1.5 py-1 text-xs text-white uppercase"
      >
        {CURRENCIES.map((code) => (
          <option key={code} value={code}>{code.toUpperCase()}</option>
        ))}
      </select>
    </div>
  );
}
