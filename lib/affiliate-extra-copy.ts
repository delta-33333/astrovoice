import type { ToolLang } from '@/lib/free-tools';
import type { Faq } from '@/lib/free-tools-copy';

export const AFFILIATE_CONTACT = 'callastralcom@gmail.com';

export interface AffiliateExtraCopy {
  cta: string;
  example: { title: string; lines: string[]; note: string };
  contact: string;
  faq: Faq[];
  payout: string;
  payoutHint: string;
  emailSent: string;
  statsLink: string;
  stats: {
    title: string; intro: string; email: string; code: string; submit: string; loading: string;
    clicks: string; signups: string; sales: string; due: string; paid: string;
    notFound: string; rate: string; fail: string; note: string; back: string;
  };
  mail: { subject: string; hello: string; intro: string; link: string; code: string; stats: string; payout: string; rules: string; sign: string };
}

export const AFFILIATE_EXTRA: Record<ToolLang, AffiliateExtraCopy> = {
  fr: {
    cta: 'Créer mon lien gratuit',
    example: { title: 'Exemple de gain (illustratif)', lines: ['1 client achète le pack 30 minutes (34,90 €) → 10,47 € pour vous', '10 clients sur ce pack → 104,70 €', '1 client prend l’offre d’accueil 10 minutes (4,90 €) → 1,47 €'], note: 'Exemple calculé sur les prix publics France actuels. Ce n’est pas une promesse de revenus : vos gains dépendent de vos ventes réelles.' },
    contact: 'Une question sur le programme ? Écrivez à callastralcom@gmail.com.',
    faq: [
      { q: 'Où suivre mes clics, inscriptions et commissions ?', a: 'Sur la page « Mes stats » : entrez votre e-mail et votre code pour voir vos clics, inscriptions, ventes et commissions (à verser et versées). Aucun seuil minimum de versement n’est annoncé.' },
      { q: 'Les conseillers sont-ils des humains ?', a: 'Non. Les Conseillères et Conseillers Callastral sont des conseillers virtuels (IA) dont la voix est générée par ordinateur ; le site l’indique (offres, tarifs, FAQ). Dites-le aussi à votre audience.' },
    ],
    payout: 'IBAN ou e-mail PayPal pour les versements (facultatif)',
    payoutHint: 'Vous pourrez aussi l’envoyer plus tard à callastralcom@gmail.com.',
    emailSent: 'Un e-mail de confirmation avec votre lien vient de vous être envoyé.',
    statsLink: 'Déjà inscrit ? Voir mes stats',
    stats: { title: 'Mes stats affilié', intro: 'Entrez l’e-mail utilisé à l’inscription et votre code affilié.', email: 'E-mail', code: 'Code affilié', submit: 'Voir mes stats', loading: 'Chargement…', clicks: 'Clics sur votre lien', signups: 'Inscriptions', sales: 'Ventes (premiers paiements)', due: 'Commissions à verser', paid: 'Commissions versées', notFound: 'E-mail ou code incorrect.', rate: 'Trop d’essais. Réessayez plus tard.', fail: 'Stats indisponibles pour le moment.', note: 'Clics comptés une fois par visiteur et par jour. Les commissions sont versées manuellement une fois par mois, après 30 jours.', back: 'Programme d’affiliation' },
    mail: { subject: 'Votre lien affilié Callastral', hello: 'Bonjour', intro: 'Bienvenue dans le programme d’affiliation Callastral : 30 % du premier paiement de chaque nouveau client arrivé par votre lien (cookie de 30 jours).', link: 'Votre lien', code: 'Votre code', stats: 'Suivre vos stats', payout: 'Pour recevoir vos commissions (versement manuel mensuel, par virement ou PayPal), répondez à cet e-mail avec votre IBAN ou votre e-mail PayPal si vous ne l’avez pas déjà indiqué.', rules: 'Rappel : présentez les conseillers comme virtuels (IA), sans faux avis ni fausse urgence.', sign: 'Julien, Callastral' },
  },
  en: {
    cta: 'Get my free link',
    example: { title: 'Example earnings (illustrative)', lines: ['1 customer buys the 30-minute pack (€34.90) → €10.47 for you', '10 customers on that pack → €104.70', '1 customer takes the 10-minute welcome offer (€4.90) → €1.47'], note: 'Example based on current public prices in France. Not an income promise: your earnings depend on your actual sales.' },
    contact: 'Questions about the program? Email callastralcom@gmail.com.',
    faq: [
      { q: 'Where can I track clicks, signups and commissions?', a: 'On the “My stats” page: enter your email and code to see your clicks, signups, sales and commissions (due and paid). No payout minimum is announced.' },
      { q: 'Are the advisors human?', a: 'No. Callastral Advisors are virtual (AI) advisors with a computer-generated voice; the site says so (offers, pricing, FAQ). Please tell your audience too.' },
    ],
    payout: 'IBAN or PayPal email for payouts (optional)',
    payoutHint: 'You can also send it later to callastralcom@gmail.com.',
    emailSent: 'A confirmation email with your link is on its way.',
    statsLink: 'Already joined? See my stats',
    stats: { title: 'My affiliate stats', intro: 'Enter the email you signed up with and your affiliate code.', email: 'Email', code: 'Affiliate code', submit: 'See my stats', loading: 'Loading…', clicks: 'Clicks on your link', signups: 'Signups', sales: 'Sales (first payments)', due: 'Commissions due', paid: 'Commissions paid', notFound: 'Wrong email or code.', rate: 'Too many attempts. Try again later.', fail: 'Stats unavailable right now.', note: 'Clicks counted once per visitor per day. Commissions are paid manually once a month, after 30 days.', back: 'Affiliate program' },
    mail: { subject: 'Your Callastral affiliate link', hello: 'Hi', intro: 'Welcome to the Callastral affiliate program: 30% of the first payment of every new customer who comes through your link (30-day cookie).', link: 'Your link', code: 'Your code', stats: 'Track your stats', payout: 'To receive commissions (manual monthly payout, bank transfer or PayPal), reply to this email with your IBAN or PayPal email if you have not given it yet.', rules: 'Reminder: present advisors as virtual (AI), no fake reviews or false urgency.', sign: 'Julien, Callastral' },
  },
  es: {
    cta: 'Crear mi enlace gratis',
    example: { title: 'Ejemplo de ganancias (ilustrativo)', lines: ['1 cliente compra el pack de 30 minutos (34,90 €) → 10,47 € para ti', '10 clientes con ese pack → 104,70 €', '1 cliente toma la oferta de bienvenida de 10 minutos (4,90 €) → 1,47 €'], note: 'Ejemplo calculado con los precios públicos actuales en Francia. No es una promesa de ingresos: tus ganancias dependen de tus ventas reales.' },
    contact: '¿Preguntas sobre el programa? Escribe a callastralcom@gmail.com.',
    faq: [
      { q: '¿Dónde sigo mis clics, registros y comisiones?', a: 'En la página «Mis estadísticas»: introduce tu correo y tu código para ver clics, registros, ventas y comisiones (pendientes y pagadas). No hay un mínimo de pago anunciado.' },
      { q: '¿Los asesores son humanos?', a: 'No. Los Asesores Callastral son asesores virtuales (IA) con voz generada por ordenador; el sitio lo indica (ofertas, precios, FAQ). Díselo también a tu audiencia.' },
    ],
    payout: 'IBAN o correo de PayPal para los pagos (opcional)',
    payoutHint: 'También puedes enviarlo más tarde a callastralcom@gmail.com.',
    emailSent: 'Te hemos enviado un correo de confirmación con tu enlace.',
    statsLink: '¿Ya estás registrado? Ver mis estadísticas',
    stats: { title: 'Mis estadísticas de afiliado', intro: 'Introduce el correo de tu registro y tu código de afiliado.', email: 'Correo', code: 'Código de afiliado', submit: 'Ver mis estadísticas', loading: 'Cargando…', clicks: 'Clics en tu enlace', signups: 'Registros', sales: 'Ventas (primeros pagos)', due: 'Comisiones pendientes', paid: 'Comisiones pagadas', notFound: 'Correo o código incorrecto.', rate: 'Demasiados intentos. Inténtalo más tarde.', fail: 'Estadísticas no disponibles ahora.', note: 'Clics contados una vez por visitante y día. Las comisiones se pagan manualmente una vez al mes, tras 30 días.', back: 'Programa de afiliados' },
    mail: { subject: 'Tu enlace de afiliado Callastral', hello: 'Hola', intro: 'Bienvenido al programa de afiliados de Callastral: 30 % del primer pago de cada nuevo cliente que llegue por tu enlace (cookie de 30 días).', link: 'Tu enlace', code: 'Tu código', stats: 'Ver tus estadísticas', payout: 'Para cobrar tus comisiones (pago manual mensual, por transferencia o PayPal), responde a este correo con tu IBAN o tu correo de PayPal si aún no lo has indicado.', rules: 'Recuerda: presenta a los asesores como virtuales (IA), sin reseñas falsas ni falsa urgencia.', sign: 'Julien, Callastral' },
  },
  de: {
    cta: 'Gratis-Link erstellen',
    example: { title: 'Beispielrechnung (zur Veranschaulichung)', lines: ['1 Kunde kauft das 30-Minuten-Paket (34,90 €) → 10,47 € für dich', '10 Kunden mit diesem Paket → 104,70 €', '1 Kunde nimmt das 10-Minuten-Willkommensangebot (4,90 €) → 1,47 €'], note: 'Beispiel auf Basis der aktuellen öffentlichen Preise in Frankreich. Kein Einkommensversprechen: deine Einnahmen hängen von deinen echten Verkäufen ab.' },
    contact: 'Fragen zum Programm? Schreib an callastralcom@gmail.com.',
    faq: [
      { q: 'Wo sehe ich Klicks, Anmeldungen und Provisionen?', a: 'Auf der Seite „Meine Statistiken“: Gib E-Mail und Code ein und sieh Klicks, Anmeldungen, Verkäufe und Provisionen (offen und ausgezahlt). Es ist kein Mindestbetrag für Auszahlungen angekündigt.' },
      { q: 'Sind die Berater Menschen?', a: 'Nein. Die Callastral-Berater sind virtuelle Berater (KI) mit computergenerierter Stimme; die Website sagt das (Angebote, Preise, FAQ). Sag es bitte auch deiner Community.' },
    ],
    payout: 'IBAN oder PayPal-E-Mail für Auszahlungen (optional)',
    payoutHint: 'Du kannst sie auch später an callastralcom@gmail.com senden.',
    emailSent: 'Eine Bestätigungs-E-Mail mit deinem Link ist unterwegs.',
    statsLink: 'Schon dabei? Meine Statistiken',
    stats: { title: 'Meine Partner-Statistiken', intro: 'Gib die E-Mail deiner Anmeldung und deinen Partnercode ein.', email: 'E-Mail', code: 'Partnercode', submit: 'Statistiken ansehen', loading: 'Lädt…', clicks: 'Klicks auf deinen Link', signups: 'Anmeldungen', sales: 'Verkäufe (erste Zahlungen)', due: 'Offene Provisionen', paid: 'Ausgezahlte Provisionen', notFound: 'E-Mail oder Code falsch.', rate: 'Zu viele Versuche. Bitte später erneut.', fail: 'Statistiken gerade nicht verfügbar.', note: 'Klicks einmal pro Besucher und Tag gezählt. Provisionen werden einmal im Monat manuell ausgezahlt, nach 30 Tagen.', back: 'Partnerprogramm' },
    mail: { subject: 'Dein Callastral-Partnerlink', hello: 'Hallo', intro: 'Willkommen im Callastral-Partnerprogramm: 30 % der ersten Zahlung jedes neuen Kunden, der über deinen Link kommt (30-Tage-Cookie).', link: 'Dein Link', code: 'Dein Code', stats: 'Deine Statistiken', payout: 'Für die Auszahlung (manuell, monatlich, per Überweisung oder PayPal) antworte auf diese E-Mail mit deiner IBAN oder PayPal-E-Mail, falls noch nicht angegeben.', rules: 'Hinweis: Stelle die Berater als virtuell (KI) vor, ohne falsche Bewertungen oder künstliche Dringlichkeit.', sign: 'Julien, Callastral' },
  },
  it: {
    cta: 'Crea il mio link gratis',
    example: { title: 'Esempio di guadagno (illustrativo)', lines: ['1 cliente compra il pacchetto da 30 minuti (34,90 €) → 10,47 € per te', '10 clienti con quel pacchetto → 104,70 €', '1 cliente prende l’offerta di benvenuto da 10 minuti (4,90 €) → 1,47 €'], note: 'Esempio calcolato sui prezzi pubblici attuali in Francia. Non è una promessa di guadagno: i tuoi guadagni dipendono dalle vendite reali.' },
    contact: 'Domande sul programma? Scrivi a callastralcom@gmail.com.',
    faq: [
      { q: 'Dove vedo clic, iscrizioni e commissioni?', a: 'Nella pagina «Le mie statistiche»: inserisci e-mail e codice per vedere clic, iscrizioni, vendite e commissioni (da pagare e pagate). Non è annunciata una soglia minima di pagamento.' },
      { q: 'I consulenti sono persone?', a: 'No. I Consulenti Callastral sono consulenti virtuali (IA) con voce generata dal computer; il sito lo indica (offerte, prezzi, FAQ). Dillo anche alla tua community.' },
    ],
    payout: 'IBAN o e-mail PayPal per i pagamenti (facoltativo)',
    payoutHint: 'Puoi anche inviarlo più tardi a callastralcom@gmail.com.',
    emailSent: 'Ti abbiamo inviato un’e-mail di conferma con il tuo link.',
    statsLink: 'Già iscritto? Vedi le mie statistiche',
    stats: { title: 'Le mie statistiche affiliato', intro: 'Inserisci l’e-mail dell’iscrizione e il tuo codice affiliato.', email: 'E-mail', code: 'Codice affiliato', submit: 'Vedi statistiche', loading: 'Caricamento…', clicks: 'Clic sul tuo link', signups: 'Iscrizioni', sales: 'Vendite (primi pagamenti)', due: 'Commissioni da pagare', paid: 'Commissioni pagate', notFound: 'E-mail o codice errati.', rate: 'Troppi tentativi. Riprova più tardi.', fail: 'Statistiche non disponibili ora.', note: 'Clic contati una volta per visitatore al giorno. Le commissioni sono pagate manualmente una volta al mese, dopo 30 giorni.', back: 'Programma di affiliazione' },
    mail: { subject: 'Il tuo link affiliato Callastral', hello: 'Ciao', intro: 'Benvenuto nel programma di affiliazione Callastral: 30% del primo pagamento di ogni nuovo cliente arrivato dal tuo link (cookie di 30 giorni).', link: 'Il tuo link', code: 'Il tuo codice', stats: 'Le tue statistiche', payout: 'Per ricevere le commissioni (pagamento manuale mensile, bonifico o PayPal), rispondi a questa e-mail con il tuo IBAN o la tua e-mail PayPal se non l’hai già indicato.', rules: 'Promemoria: presenta i consulenti come virtuali (IA), senza recensioni false né falsa urgenza.', sign: 'Julien, Callastral' },
  },
};

export function affiliateStatsPath(locale: ToolLang): string {
  return `/${locale}/affiliate-stats`;
}
