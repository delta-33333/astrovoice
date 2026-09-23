'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { loadStripe, type StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import {
  CheckoutElementsProvider,
  ContactDetailsElement,
  ExpressCheckoutElement,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

const stripePromise =
  publishableKey && !publishableKey.includes('placeholder')
    ? loadStripe(publishableKey, { locale: 'fr' })
    : null;

const appearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#d4af37',
    colorBackground: '#121826',
    colorText: '#f7f4ec',
    colorDanger: '#e7b3b0',
    colorTextSecondary: '#c9c3b4',
    colorTextPlaceholder: '#9a9486',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
  },
};

type PaymentSheetProps = {
  open: boolean;
  title: string;
  amountLabel: string;
  detail: string;
  payLabel: string;
  clientSecret: string | null;
  collectContact?: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PaymentSheet(props: PaymentSheetProps) {
  const { open, onClose } = props;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-sheet-title"
        className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0c1018] px-5 pt-5 pb-8 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-celestial-gold/80">Callastral</p>
            <h2 id="payment-sheet-title" className="font-[family-name:var(--font-cinzel)] text-2xl mt-1">
              {props.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white text-sm px-2 py-1"
          >
            Fermer
          </button>
        </div>

        <p className="text-3xl font-semibold text-celestial-gold mb-2">{props.amountLabel}</p>
        <p className="text-sm text-white/70 leading-relaxed mb-6">{props.detail}</p>

        {!stripePromise && (
          <p className="text-sm text-red-200">
            Le paiement n’est pas disponible pour le moment.
          </p>
        )}

        {stripePromise && props.clientSecret && (
          <CheckoutElementsProvider
            key={props.clientSecret}
            stripe={stripePromise}
            options={{
              clientSecret: props.clientSecret,
              elementsOptions: { appearance, loader: 'auto' },
            }}
          >
            <CheckoutFields
              payLabel={props.payLabel}
              collectContact={props.collectContact}
              onSuccess={props.onSuccess}
            />
          </CheckoutElementsProvider>
        )}

        {stripePromise && !props.clientSecret && (
          <p className="text-sm text-white/60">Préparation du paiement…</p>
        )}
      </div>
    </div>
  );
}

function CheckoutFields({
  payLabel,
  collectContact,
  onSuccess,
}: {
  payLabel: string;
  collectContact?: boolean;
  onSuccess: () => void;
}) {
  const checkoutState = useCheckoutElements();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletsReady, setWalletsReady] = useState(false);
  const lock = useRef(false);

  const confirmPayment = async (expressEvent?: StripeExpressCheckoutElementConfirmEvent) => {
    if (checkoutState.type !== 'success' || lock.current) return;
    lock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const result = await checkoutState.checkout.confirm({
        redirect: 'if_required',
        ...(expressEvent ? { expressCheckoutConfirmEvent: expressEvent } : {}),
      });
      if (result.type === 'error') {
        const message = result.error.message || 'Le paiement n’a pas abouti.';
        expressEvent?.paymentFailed({ message });
        setError(message);
        lock.current = false;
        setSubmitting(false);
        return;
      }
      onSuccess();
    } catch {
      expressEvent?.paymentFailed({ message: 'Le paiement n’a pas abouti.' });
      setError('Le paiement n’a pas abouti. Vous pouvez réessayer.');
      lock.current = false;
      setSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void confirmPayment();
  };

  if (checkoutState.type === 'loading') {
    return <p className="text-sm text-white/60">Ouverture du paiement sécurisé…</p>;
  }

  if (checkoutState.type === 'error') {
    return <p className="text-sm text-red-200">{checkoutState.error.message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {collectContact && (
        <div>
          <p className="text-sm text-white/70 mb-2">Adresse pour le reçu</p>
          <ContactDetailsElement />
        </div>
      )}
      <ExpressCheckoutElement
        options={{
          buttonHeight: 48,
          buttonTheme: { applePay: 'white-outline', googlePay: 'white' },
          buttonType: { applePay: 'plain', googlePay: 'pay' },
          layout: { maxColumns: 1, maxRows: 2, overflow: 'auto' },
          paymentMethodOrder: ['applePay', 'googlePay'],
          paymentMethods: {
            applePay: 'auto',
            googlePay: 'auto',
            link: 'never',
            paypal: 'never',
            amazonPay: 'never',
            klarna: 'never',
          },
        }}
        onReady={(event) => {
          const methods = event.availablePaymentMethods;
          setWalletsReady(Boolean(methods?.applePay || methods?.googlePay));
        }}
        onConfirm={(event) => {
          void confirmPayment(event);
        }}
      />
      {walletsReady && (
        <p className="text-center text-xs uppercase tracking-[0.16em] text-white/40">ou</p>
      )}
      <PaymentElement
        options={{
          layout: 'accordion',
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }}
      />
      {error && (
        <p className="text-sm text-red-200" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Paiement…' : payLabel}
      </button>
      <p className="text-center text-xs text-white/40">
        Paiement sécurisé par Stripe · Apple Pay et Google Pay s’affichent lorsque votre appareil les propose.
      </p>
    </form>
  );
}
