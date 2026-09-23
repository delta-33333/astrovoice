import { Suspense } from 'react';
import ReturnClient from './return-client';

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white/60">
          Confirmation du paiement…
        </div>
      }
    >
      <ReturnClient />
    </Suspense>
  );
}
