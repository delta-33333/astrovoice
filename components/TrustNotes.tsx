export default function TrustNotes({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55 ${className}`}>
      <li>Paiement sécurisé Stripe</li>
      <li>Annulation jusqu’à 24 h avant</li>
      <li>Échanges confidentiels</li>
    </ul>
  );
}
