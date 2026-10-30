import type { Locale } from '@/lib/seo';

/** Textes de la page Offres, par langue (aucun mélange de langues). */
export interface OffersCopy {
  title: string; intro: string; weekly: string; three: string; plansIntro: string; recommended: string; plan: string;
  firstWeek: (price: string) => string; perWeek: (minutes: number) => string; choose: (name: string) => string;
  summary: string; summaryBody: string; natal: string; natalBody: string; natalCta: string;
  forecast: string; forecastBody: string; forecastCta: string; compat: string; compatBody: string; compatTitle: string;
  personA: string; personB: string; compatCta: string; rebook: string; rebookBody: string; rebookCta: string;
  subDetail: string; reportDetail: string; pay: string; error: string; savedBirth: string; edit: string;
  name: string; birthDate: string; time: string; timeUnknown: string; place: string; metaDescription: string;
}

export const OFFERS_COPY: Record<Locale, OffersCopy> = {
  fr: {
    title: 'Offres', intro: 'Tous les prix ci-dessous sont ceux encaissés. Chaque formule inclut un volume de minutes par semaine, avec 60 minutes maximum par appel.',
    weekly: 'Chaque semaine', three: 'Trois formules', plansIntro: '60 minutes maximum par appel. La première semaine est à tarif réduit, puis le prix affiché. Sans engagement, résiliable en 1 clic.',
    recommended: 'Recommandé', plan: 'Formule', firstWeek: (p) => `la 1re semaine, puis ${p}/semaine`, perWeek: (m) => `${m} minutes par semaine`, choose: (n) => `Choisir ${n}`,
    summary: 'Résumé écrit', summaryBody: 'Après une consultation, le résumé de ce qui a été dit est envoyé par e-mail. Le paiement se fait depuis la page de fin d’appel.',
    natal: 'Thème natal', natalBody: 'Portrait écrit à partir des positions calculées, en PDF dans le compte et par e-mail.', natalCta: 'Recevoir le thème',
    forecast: 'Prévision 2026 et 2027', forecastBody: 'Lecture de l’année à partir du thème natal et du ciel du 1er janvier de chaque année.', forecastCta: 'Recevoir la prévision',
    compat: 'Compatibilité', compatTitle: 'Lecture de compatibilité', compatBody: 'Lecture croisée de deux thèmes, envoyée par e-mail et conservée dans le compte.', personA: 'Première personne', personB: 'Deuxième personne', compatCta: 'Recevoir la lecture',
    rebook: 'Reprise · 15 %', rebookBody: 'Après une consultation, le prochain rendez-vous payant bénéficie de 15 % de réduction, pendant 30 jours. Une seule offre en attente à la fois.', rebookCta: 'Reprendre un créneau',
    subDetail: '60 minutes maximum par appel.', reportDetail: 'Paiement sécurisé. Le document arrive par e-mail et dans le compte.', pay: 'Payer', error: 'Le paiement n’a pas pu être préparé.',
    savedBirth: 'Vos coordonnées de naissance', edit: 'Modifier', name: 'Prénom', birthDate: 'Date de naissance', time: 'Heure', timeUnknown: 'Heure inconnue (midi utilisé pour les maisons)', place: 'Lieu de naissance',
    metaDescription: 'Formules hebdomadaires Découverte, Essentiel et Premium, plus les documents écrits.',
  },
  en: {
    title: 'Plans', intro: 'All prices below are the amounts charged. Each plan includes a number of minutes per week, with 60 minutes maximum per call.',
    weekly: 'Every week', three: 'Three plans', plansIntro: '60 minutes maximum per call. The first week is discounted, then the price shown. No commitment, cancel in one click.',
    recommended: 'Recommended', plan: 'Plan', firstWeek: (p) => `the first week, then ${p}/week`, perWeek: (m) => `${m} minutes per week`, choose: (n) => `Choose ${n}`,
    summary: 'Written summary', summaryBody: 'After a consultation, a summary of what was said is sent by email. Payment is made from the end-of-call page.',
    natal: 'Birth chart', natalBody: 'Written portrait from the calculated positions, as a PDF in your account and by email.', natalCta: 'Get the chart',
    forecast: '2026 and 2027 forecast', forecastBody: 'A reading of the year from your birth chart and the sky on January 1st of each year.', forecastCta: 'Get the forecast',
    compat: 'Compatibility', compatTitle: 'Compatibility reading', compatBody: 'A cross reading of two charts, sent by email and kept in your account.', personA: 'First person', personB: 'Second person', compatCta: 'Get the reading',
    rebook: 'Come back · 15%', rebookBody: 'After a consultation, your next paid session is 15% off for 30 days. One pending offer at a time.', rebookCta: 'Book again',
    subDetail: '60 minutes maximum per call.', reportDetail: 'Secure payment. The document arrives by email and in your account.', pay: 'Pay', error: 'The payment could not be prepared.',
    savedBirth: 'Your birth details', edit: 'Edit', name: 'First name', birthDate: 'Date of birth', time: 'Time', timeUnknown: 'Time unknown (noon used for houses)', place: 'Place of birth',
    metaDescription: 'Weekly Discovery, Essential and Premium plans, plus written reports.',
  },
  es: {
    title: 'Ofertas', intro: 'Todos los precios son los cobrados. Cada fórmula incluye minutos por semana, con 60 minutos como máximo por llamada.',
    weekly: 'Cada semana', three: 'Tres fórmulas', plansIntro: '60 minutos como máximo por llamada. La primera semana tiene precio reducido, luego el precio indicado. Sin compromiso, se cancela en un clic.',
    recommended: 'Recomendado', plan: 'Fórmula', firstWeek: (p) => `la 1.ª semana, luego ${p}/semana`, perWeek: (m) => `${m} minutos por semana`, choose: (n) => `Elegir ${n}`,
    summary: 'Resumen escrito', summaryBody: 'Tras una consulta, el resumen de lo dicho se envía por correo. El pago se hace desde la página de fin de llamada.',
    natal: 'Carta natal', natalBody: 'Retrato escrito a partir de las posiciones calculadas, en PDF en la cuenta y por correo.', natalCta: 'Recibir la carta',
    forecast: 'Previsión 2026 y 2027', forecastBody: 'Lectura del año a partir de la carta natal y del cielo del 1 de enero de cada año.', forecastCta: 'Recibir la previsión',
    compat: 'Compatibilidad', compatTitle: 'Lectura de compatibilidad', compatBody: 'Lectura cruzada de dos cartas, enviada por correo y guardada en la cuenta.', personA: 'Primera persona', personB: 'Segunda persona', compatCta: 'Recibir la lectura',
    rebook: 'Vuelta · 15 %', rebookBody: 'Tras una consulta, la siguiente cita de pago tiene un 15 % de descuento durante 30 días. Una sola oferta pendiente a la vez.', rebookCta: 'Reservar de nuevo',
    subDetail: '60 minutos como máximo por llamada.', reportDetail: 'Pago seguro. El documento llega por correo y a la cuenta.', pay: 'Pagar', error: 'No se pudo preparar el pago.',
    savedBirth: 'Tus datos de nacimiento', edit: 'Modificar', name: 'Nombre', birthDate: 'Fecha de nacimiento', time: 'Hora', timeUnknown: 'Hora desconocida (se usa el mediodía para las casas)', place: 'Lugar de nacimiento',
    metaDescription: 'Fórmulas semanales Descubrimiento, Esencial y Premium, y documentos escritos.',
  },
  de: {
    title: 'Angebote', intro: 'Alle Preise sind die tatsächlich abgebuchten Beträge. Jeder Tarif enthält Minuten pro Woche, maximal 60 Minuten pro Anruf.',
    weekly: 'Jede Woche', three: 'Drei Tarife', plansIntro: 'Maximal 60 Minuten pro Anruf. Die erste Woche ist reduziert, danach gilt der angezeigte Preis. Ohne Bindung, Kündigung mit einem Klick.',
    recommended: 'Empfohlen', plan: 'Tarif', firstWeek: (p) => `die 1. Woche, danach ${p}/Woche`, perWeek: (m) => `${m} Minuten pro Woche`, choose: (n) => `${n} wählen`,
    summary: 'Schriftliche Zusammenfassung', summaryBody: 'Nach einer Beratung wird die Zusammenfassung per E-Mail gesendet. Bezahlt wird auf der Seite nach dem Anruf.',
    natal: 'Geburtshoroskop', natalBody: 'Schriftliches Porträt aus den berechneten Positionen, als PDF im Konto und per E-Mail.', natalCta: 'Horoskop erhalten',
    forecast: 'Prognose 2026 und 2027', forecastBody: 'Jahresdeutung aus dem Geburtshoroskop und dem Himmel am 1. Januar jedes Jahres.', forecastCta: 'Prognose erhalten',
    compat: 'Kompatibilität', compatTitle: 'Kompatibilitätsdeutung', compatBody: 'Vergleich zweier Horoskope, per E-Mail gesendet und im Konto gespeichert.', personA: 'Erste Person', personB: 'Zweite Person', compatCta: 'Deutung erhalten',
    rebook: 'Wiederkommen · 15 %', rebookBody: 'Nach einer Beratung ist der nächste bezahlte Termin 30 Tage lang 15 % günstiger. Nur ein offenes Angebot gleichzeitig.', rebookCta: 'Erneut buchen',
    subDetail: 'Maximal 60 Minuten pro Anruf.', reportDetail: 'Sichere Zahlung. Das Dokument kommt per E-Mail und ins Konto.', pay: 'Bezahlen', error: 'Die Zahlung konnte nicht vorbereitet werden.',
    savedBirth: 'Ihre Geburtsdaten', edit: 'Ändern', name: 'Vorname', birthDate: 'Geburtsdatum', time: 'Uhrzeit', timeUnknown: 'Uhrzeit unbekannt (Mittag für die Häuser)', place: 'Geburtsort',
    metaDescription: 'Wöchentliche Tarife Entdeckung, Essenziell und Premium sowie schriftliche Deutungen.',
  },
  it: {
    title: 'Offerte', intro: 'Tutti i prezzi sono quelli addebitati. Ogni formula include minuti a settimana, con 60 minuti al massimo per chiamata.',
    weekly: 'Ogni settimana', three: 'Tre formule', plansIntro: '60 minuti al massimo per chiamata. La prima settimana è scontata, poi il prezzo indicato. Senza vincoli, disdetta in un clic.',
    recommended: 'Consigliato', plan: 'Formula', firstWeek: (p) => `la 1ª settimana, poi ${p}/settimana`, perWeek: (m) => `${m} minuti a settimana`, choose: (n) => `Scegli ${n}`,
    summary: 'Riassunto scritto', summaryBody: 'Dopo un consulto, il riassunto viene inviato per e-mail. Il pagamento avviene dalla pagina di fine chiamata.',
    natal: 'Tema natale', natalBody: 'Ritratto scritto dalle posizioni calcolate, in PDF nell’account e per e-mail.', natalCta: 'Ricevi il tema',
    forecast: 'Previsione 2026 e 2027', forecastBody: 'Lettura dell’anno dal tema natale e dal cielo del 1° gennaio di ogni anno.', forecastCta: 'Ricevi la previsione',
    compat: 'Compatibilità', compatTitle: 'Lettura di compatibilità', compatBody: 'Lettura incrociata di due temi, inviata per e-mail e conservata nell’account.', personA: 'Prima persona', personB: 'Seconda persona', compatCta: 'Ricevi la lettura',
    rebook: 'Ritorno · 15 %', rebookBody: 'Dopo un consulto, il prossimo appuntamento a pagamento ha il 15 % di sconto per 30 giorni. Una sola offerta in attesa alla volta.', rebookCta: 'Prenota di nuovo',
    subDetail: '60 minuti al massimo per chiamata.', reportDetail: 'Pagamento sicuro. Il documento arriva per e-mail e nell’account.', pay: 'Paga', error: 'Il pagamento non è stato preparato.',
    savedBirth: 'I tuoi dati di nascita', edit: 'Modifica', name: 'Nome', birthDate: 'Data di nascita', time: 'Ora', timeUnknown: 'Ora sconosciuta (mezzogiorno per le case)', place: 'Luogo di nascita',
    metaDescription: 'Formule settimanali Scoperta, Essenziale e Premium, più i documenti scritti.',
  },
};
