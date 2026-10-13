import type { AdvisorLang } from './money.ts';

export interface BookCopy {
  title: string;
  plan: string;
  minutes: string;
  thenWeek: (full: string) => string;
  birthTitle: string;
  accountTitle: string;
  firstName: string;
  email: string;
  password: string;
  passwordHint: string;
  signup: string;
  login: string;
  forgot: string;
  pay: (price: string) => string;
  preparing: string;
  included: string;
  includedButton: string;
  pickAdvisor: string;
  trust: readonly string[];
  wallet: string;
  hold: string;
  back: string;
  emailInvalid: string;
  nameRequired: string;
  passwordRequired: string;
  aiNote: string;
}

const FR: BookCopy = {
  title: 'Votre thème, en 10 minutes',
  plan: 'Découverte',
  minutes: '10 minutes avec un conseiller virtuel',
  thenWeek: (full) => `puis ${full}/semaine`,
  birthTitle: 'Naissance reprise du calcul',
  accountTitle: 'Pour le reçu et l’appel',
  firstName: 'Prénom',
  email: 'E-mail',
  password: 'Mot de passe',
  passwordHint: '8 caractères minimum. Le compte est créé au moment du paiement.',
  signup: 'Créer un compte',
  login: 'Déjà un compte',
  forgot: 'Mot de passe oublié',
  pay: (price) => `Payer ${price}`,
  preparing: 'Préparation…',
  included: 'Ces 10 minutes sont incluses dans votre formule.',
  includedButton: 'Rejoindre l’appel',
  pickAdvisor: 'Choisir un conseiller',
  trust: ['Paiement sécurisé Stripe', 'Sans engagement, résiliable en 1 clic', 'Échanges confidentiels'],
  wallet: 'Apple Pay et Google Pay s’affichent si votre appareil les propose.',
  hold: 'Le créneau est bloqué 10 minutes, le temps du paiement.',
  back: '← Annuaire',
  emailInvalid: 'Indiquez un e-mail valide.',
  nameRequired: 'Indiquez votre prénom.',
  passwordRequired: 'E-mail et mot de passe requis.',
  aiNote: 'Conseiller virtuel — voix générée par IA',
};

const EN: BookCopy = {
  title: 'Your chart, in 10 minutes',
  plan: 'Discovery',
  minutes: '10 minutes with a virtual advisor',
  thenWeek: (full) => `then ${full}/week`,
  birthTitle: 'Birth details from the calculator',
  accountTitle: 'For the receipt and the call',
  firstName: 'First name',
  email: 'Email',
  password: 'Password',
  passwordHint: 'At least 8 characters. The account is created when you pay.',
  signup: 'Create an account',
  login: 'I already have an account',
  forgot: 'Forgot password',
  pay: (price) => `Pay ${price}`,
  preparing: 'Preparing…',
  included: 'These 10 minutes are included in your plan.',
  includedButton: 'Join the call',
  pickAdvisor: 'Choose an advisor',
  trust: ['Secure payment by Stripe', 'No commitment, cancel in one click', 'Private conversations'],
  wallet: 'Apple Pay and Google Pay appear when your device offers them.',
  hold: 'The slot is held for 10 minutes while you pay.',
  back: '← Directory',
  emailInvalid: 'Enter a valid email.',
  nameRequired: 'Enter your first name.',
  passwordRequired: 'Email and password are required.',
  aiNote: 'Virtual advisor — AI-generated voice',
};

const ES: BookCopy = {
  title: 'Tu carta, en 10 minutos',
  plan: 'Descubrimiento',
  minutes: '10 minutos con un consejero virtual',
  thenWeek: (full) => `luego ${full}/semana`,
  birthTitle: 'Nacimiento tomado del cálculo',
  accountTitle: 'Para el recibo y la llamada',
  firstName: 'Nombre',
  email: 'Correo',
  password: 'Contraseña',
  passwordHint: '8 caracteres como mínimo. La cuenta se crea al pagar.',
  signup: 'Crear una cuenta',
  login: 'Ya tengo una cuenta',
  forgot: 'Contraseña olvidada',
  pay: (price) => `Pagar ${price}`,
  preparing: 'Preparando…',
  included: 'Estos 10 minutos están incluidos en tu fórmula.',
  includedButton: 'Entrar en la llamada',
  pickAdvisor: 'Elegir un consejero',
  trust: ['Pago seguro con Stripe', 'Sin permanencia, cancelable en 1 clic', 'Conversaciones confidenciales'],
  wallet: 'Apple Pay y Google Pay aparecen si tu dispositivo los ofrece.',
  hold: 'El turno queda bloqueado 10 minutos mientras pagas.',
  back: '← Directorio',
  emailInvalid: 'Indica un correo válido.',
  nameRequired: 'Indica tu nombre.',
  passwordRequired: 'Correo y contraseña obligatorios.',
  aiNote: 'Consejero virtual — voz generada por IA',
};

const DE: BookCopy = {
  title: 'Ihr Horoskop, in 10 Minuten',
  plan: 'Entdeckung',
  minutes: '10 Minuten mit einem virtuellen Berater',
  thenWeek: (full) => `danach ${full}/Woche`,
  birthTitle: 'Geburt aus der Berechnung',
  accountTitle: 'Für die Quittung und den Anruf',
  firstName: 'Vorname',
  email: 'E-Mail',
  password: 'Passwort',
  passwordHint: 'Mindestens 8 Zeichen. Das Konto entsteht beim Bezahlen.',
  signup: 'Konto erstellen',
  login: 'Ich habe schon ein Konto',
  forgot: 'Passwort vergessen',
  pay: (price) => `${price} zahlen`,
  preparing: 'Wird vorbereitet…',
  included: 'Diese 10 Minuten sind in Ihrer Formel enthalten.',
  includedButton: 'Anruf beitreten',
  pickAdvisor: 'Berater wählen',
  trust: ['Sichere Zahlung über Stripe', 'Ohne Bindung, mit 1 Klick kündbar', 'Vertrauliche Gespräche'],
  wallet: 'Apple Pay und Google Pay erscheinen, wenn Ihr Gerät sie anbietet.',
  hold: 'Der Termin bleibt 10 Minuten reserviert, während Sie zahlen.',
  back: '← Verzeichnis',
  emailInvalid: 'Geben Sie eine gültige E-Mail ein.',
  nameRequired: 'Geben Sie Ihren Vornamen ein.',
  passwordRequired: 'E-Mail und Passwort sind nötig.',
  aiNote: 'Virtueller Berater — KI-Stimme',
};

const IT: BookCopy = {
  title: 'Il tuo tema, in 10 minuti',
  plan: 'Scoperta',
  minutes: '10 minuti con un consulente virtuale',
  thenWeek: (full) => `poi ${full}/settimana`,
  birthTitle: 'Nascita ripresa dal calcolo',
  accountTitle: 'Per la ricevuta e la chiamata',
  firstName: 'Nome',
  email: 'E-mail',
  password: 'Password',
  passwordHint: 'Almeno 8 caratteri. L’account si crea al momento del pagamento.',
  signup: 'Crea un account',
  login: 'Ho già un account',
  forgot: 'Password dimenticata',
  pay: (price) => `Paga ${price}`,
  preparing: 'Preparazione…',
  included: 'Questi 10 minuti sono inclusi nella tua formula.',
  includedButton: 'Entra nella chiamata',
  pickAdvisor: 'Scegli un consulente',
  trust: ['Pagamento sicuro con Stripe', 'Senza vincoli, disdetta in 1 clic', 'Conversazioni riservate'],
  wallet: 'Apple Pay e Google Pay compaiono se il dispositivo li propone.',
  hold: 'Lo slot resta bloccato 10 minuti mentre paghi.',
  back: '← Elenco',
  emailInvalid: 'Indica un’e-mail valida.',
  nameRequired: 'Indica il tuo nome.',
  passwordRequired: 'E-mail e password obbligatorie.',
  aiNote: 'Consulente virtuale — voce generata dall’IA',
};

const COPY: Record<AdvisorLang, BookCopy> = { fr: FR, en: EN, es: ES, de: DE, it: IT };

export function bookCopy(locale: AdvisorLang): BookCopy {
  return COPY[locale] ?? FR;
}
