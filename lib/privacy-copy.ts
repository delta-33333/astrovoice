import type { LegalIdentity } from './legal-entity';
import type { Locale } from './seo';

export type PrivacySection = { heading: string; paragraphs: string[] };

export type PrivacyDocument = {
  title: string;
  description: string;
  sections: PrivacySection[];
};

function block(heading: string, paragraphs: string[]): PrivacySection {
  return { heading, paragraphs };
}

function featureNotice(locale: Locale): PrivacySection {
  const copy: Record<Locale, PrivacySection> = {
    fr: block('Mémoire du conseiller et horoscope du matin', [
      'Après un appel, si la mémoire du conseiller est active, Callastral enregistre un court résumé : sujets, questions, conseils et humeur. Ce résumé est visible dans l’historique du compte. Les trois derniers résumés sont relus par le conseiller virtuel à l’appel suivant, pour reprendre le fil. Un e-mail de rappel part avec ce résumé, les transits de la semaine et une proposition de première semaine Découverte. La mémoire est active par défaut. Depuis le compte, le bouton Mémoire du conseiller la coupe, et le bouton d’effacement supprime cet historique.',
      'L’horoscope du matin est un e-mail distinct. Il demande une case de consentement et un second clic de confirmation. Sont enregistrés : l’e-mail, la langue, le signe, une date de naissance facultative, la source UTM et l’horodatage de confirmation. Le texte du jour est préparé une fois par signe et par langue, pas une fois par personne. Chaque message contient un lien de désinscription en un clic.',
      'L’outil de compatibilité de couple calcule un score sans créer de compte. Le lien partagé ne conserve que le score, les phrases et les initiales : pas la date, l’heure ni le lieu de naissance.',
    ]),
    en: block('Advisor memory and morning horoscope', [
      'After a call, if advisor memory is on, Callastral stores a short summary: topics, questions, advice and mood. The summary is visible in the account history. The last three summaries are read by the virtual advisor on the next call, to pick up the thread. A recap email includes that summary, the week’s transits and an offer for the Découverte first week. Memory is on by default. In the account, the Advisor memory control turns it off, and the delete button removes this history.',
      'The morning horoscope is a separate email. It asks for a consent checkbox and a second confirmation click. Stored data: email, language, sign, an optional birth date, the UTM source and the confirmation timestamp. The day’s text is prepared once per sign and language, not once per person. Each message has a one-click unsubscribe link.',
      'The couple compatibility tool computes a score without an account. The shared link keeps only the score, the sentences and the initials: not the birth date, time or place.',
    ]),
    es: block('Memoria del consejero y horóscopo de la mañana', [
      'Después de una llamada, si la memoria del consejero está activa, Callastral guarda un resumen breve: temas, preguntas, consejos y estado de ánimo. El resumen se ve en el historial de la cuenta. Los tres últimos se leen en la llamada siguiente para retomar el hilo. Un correo de resumen incluye ese texto, los tránsitos de la semana y la primera semana Découverte. La memoria está activa por defecto. En la cuenta se puede desactivar y borrar ese historial.',
      'El horóscopo de la mañana es un correo aparte. Pide una casilla de consentimiento y un segundo clic de confirmación. Se guardan el correo, el idioma, el signo, una fecha de nacimiento opcional, la fuente UTM y la fecha de confirmación. El texto del día se prepara una vez por signo e idioma, no una vez por persona. Cada mensaje tiene una baja en un clic.',
      'La compatibilidad de pareja calcula una puntuación sin cuenta. El enlace compartido solo guarda la puntuación, las frases y las iniciales: no la fecha, la hora ni el lugar de nacimiento.',
    ]),
    de: block('Beratergedächtnis und Morgenhoroskop', [
      'Nach einem Anruf speichert Callastral, wenn das Beratergedächtnis aktiv ist, eine kurze Zusammenfassung: Themen, Fragen, Rat und Stimmung. Sie ist im Kontoverlauf sichtbar. Die letzten drei Zusammenfassungen liest der virtuelle Berater beim nächsten Anruf, um anzuknüpfen. Eine Erinnerungs-E-Mail enthält diese Zusammenfassung, die Transite der Woche und das Angebot der ersten Découverte-Woche. Das Gedächtnis ist standardmäßig an. Im Konto lässt es sich abschalten, und der Löschknopf entfernt diesen Verlauf.',
      'Das Morgenhoroskop ist eine eigene E-Mail. Es verlangt ein Einwilligungsfeld und einen zweiten Bestätigungsklick. Gespeichert werden E-Mail, Sprache, Zeichen, ein optionales Geburtsdatum, die UTM-Quelle und der Bestätigungszeitpunkt. Der Tagestext wird einmal je Zeichen und Sprache erzeugt, nicht je Person. Jede Nachricht hat einen Abmeldelink mit einem Klick.',
      'Das Partner-Werkzeug berechnet einen Score ohne Konto. Der geteilte Link behält nur Score, Sätze und Initialen: nicht Datum, Uhrzeit oder Geburtsort.',
    ]),
    it: block('Memoria del consulente e oroscopo del mattino', [
      'Dopo una chiamata, se la memoria del consulente è attiva, Callastral registra un riassunto breve: temi, domande, consigli e umore. Il riassunto è visibile nello storico dell’account. Gli ultimi tre vengono riletti dal consulente virtuale alla chiamata successiva, per riprendere il filo. Un’e-mail di promemoria include quel riassunto, i transiti della settimana e la prima settimana Découverte. La memoria è attiva per impostazione predefinita. Dall’account si può disattivare e cancellare questo storico.',
      'L’oroscopo del mattino è un’e-mail a parte. Chiede una casella di consenso e un secondo clic di conferma. Sono registrati e-mail, lingua, segno, una data di nascita facoltativa, la fonte UTM e l’orario di conferma. Il testo del giorno è preparato una volta per segno e lingua, non una volta per persona. Ogni messaggio ha un link di disiscrizione con un clic.',
      'Lo strumento di compatibilità di coppia calcola un punteggio senza account. Il link condiviso conserva solo punteggio, frasi e iniziali: non data, ora né luogo di nascita.',
    ]),
  };
  return copy[locale];
}

function french(legal: LegalIdentity): PrivacyDocument {
  return {
    title: 'Politique de confidentialité et RGPD',
    description:
      'Données de compte, de naissance, d’appels, paiements Stripe, cookies cl_vid et cl_ft, finalités, durées, droits et contact.',
    sections: [
      block('Responsable du traitement', [
        `Le responsable du traitement est ${legal.entity}${legal.idMissing ? '' : ` (${legal.id})`}, ${legal.address}.`,
        'Tant que ces éléments ne sont pas renseignés dans la configuration du site, ils apparaissent entre crochets. Ce ne sont pas des informations juridiques inventées.',
        `Pour exercer vos droits : ${legal.email}.`,
      ]),
      block('Données collectées', [
        'Compte : adresse e-mail, prénom, mot de passe sous forme d’empreinte, et l’identifiant de session du cookie httpOnly lunara_session.',
        'Données de naissance : date, heure (ou le fait qu’elle est inconnue) et lieu, utilisés pour calculer le thème natal avec Swiss Ephemeris. L’outil d’ascendant gratuit ne crée pas de compte et n’enregistre pas l’instant de naissance.',
        'Appels et voix : la voix est traitée en temps réel pour la conversation. Une transcription texte peut être conservée pour le résumé écrit demandé et pour la sécurité du service. L’audio brut de l’appel n’est pas archivé comme un fichier sonore.',
        'Paiements : ils passent par Stripe. Callastral ne stocke pas le numéro complet de carte. Stripe transmet le statut du paiement, un identifiant de transaction et, si vous l’avez saisi, un moyen de contact de facturation.',
        'Cookies de première visite : cl_ft (90 jours) mémorise utm_source, utm_medium, utm_campaign, le référent et la page d’arrivée. cl_vid (12 mois) est un identifiant aléatoire pour compter les visiteurs uniques. Ils sont posés à la première visite, hors pages /admin et hors robots, et ne servent pas à de la publicité. Le cookie cl_ck mémorise votre choix et est strictement nécessaire.',
        'Mesure d’audience Vercel Analytics et Vercel Speed Insights, uniquement si vous acceptez la mesure d’audience.',
        'E-mails via Resend : messages de compte, réinitialisation de mot de passe, résumé de consultation, et un seul rappel si un paiement est commencé et non terminé. Ce rappel contient un lien de désinscription.',
      ]),
      block('Finalités et bases légales', [
        'Exécution du contrat : créer le compte, calculer le thème, mener l’appel, encaisser le paiement, fournir le résumé ou le rapport demandé.',
        'Obligation légale : comptabilité et réponses aux demandes des autorités lorsqu’elles sont fondées.',
        'Consentement : Vercel Analytics et Speed Insights. Vous pouvez retirer ce consentement à tout moment via le lien Cookies.',
        'Intérêt légitime : cookies cl_vid et cl_ft pour savoir quelles pages et quelles campagnes mènent à un compte ou à un paiement, sécurité du service, limitation des abus, et un seul e-mail de rappel de paiement avec désinscription.',
      ]),
      block('Durées de conservation', [
        'Les données du compte, le thème natal et les transcriptions sont conservés pendant la vie du compte, puis supprimés ou anonymisés après une demande d’effacement, sous réserve des obligations légales de conservation (facturation).',
        'Les cookies de mesure expirent au plus tard aux durées indiquées ci-dessus. Le cookie de consentement cl_ck est conservé 6 mois.',
        'Les journaux techniques de sécurité sont conservés le temps nécessaire à la détection d’abus, sans constituer un profil commercial.',
      ]),
      block('Sous-traitants', [
        'Vercel : hébergement de l’application, et mesure d’audience seulement après consentement.',
        'Supabase : base de données, schéma callastral, accessible uniquement avec une clé serveur.',
        'Stripe : paiement.',
        'xAI : génération de la voix du conseiller pendant l’appel et rédaction des textes de rapports demandés.',
        'Resend : envoi des e-mails transactionnels.',
        'Ces prestataires peuvent traiter des données en dehors de l’Union européenne. Les transferts reposent sur leurs clauses contractuelles types lorsqu’ils sont requis. La liste exacte des lieux de traitement est celle publiée par chaque prestataire.',
      ]),
      block('Cookies', [
        'Aucun cookie de mesure n’est déposé avant un choix. Accepter, Refuser et Personnaliser ont le même poids visuel.',
        'Refuser laisse le site utilisable. Les pages vues restent comptées sans cookie et sans identifiant cl_vid. Le paiement, le compte et l’appel ne dépendent pas de ce choix.',
      ]),
      block('Vos droits', [
        'Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, la portabilité et l’opposition, et retirer un consentement, en écrivant à l’adresse de contact.',
        'Vous pouvez aussi introduire une réclamation auprès de l’autorité de protection des données de votre pays. En France, il s’agit de la CNIL (cnil.fr).',
      ]),
      featureNotice('fr'),
      block('Contact', [
        `Écrivez à ${legal.email}. Si l’adresse est encore un marqueur entre crochets, elle n’a pas été configurée : la demande peut aussi être faite depuis le compte lorsque vous êtes connecté, et elle sera traitée dès que l’adresse de contact est renseignée.`,
      ]),
    ],
  };
}

function english(legal: LegalIdentity): PrivacyDocument {
  return {
    title: 'Privacy policy and GDPR',
    description:
      'Account, birth data, calls, Stripe payments, cl_vid and cl_ft cookies, purposes, retention, rights and contact.',
    sections: [
      block('Controller', [
        `The controller is ${legal.entity}${legal.idMissing ? '' : ` (${legal.id})`}, ${legal.address}.`,
        'Until these values are set in the site configuration, they stay in brackets. They are not invented legal details.',
        `To exercise your rights: ${legal.email}.`,
      ]),
      block('Data we collect', [
        'Account: email address, first name, password stored as a hash, and the httpOnly session cookie lunara_session.',
        'Birth data: date, time (or the fact that it is unknown) and place, used to compute the birth chart with Swiss Ephemeris. The free rising-sign tool does not create an account and does not store the moment of birth.',
        'Calls and voice: voice is processed in real time for the conversation. A text transcript may be kept for a written summary you request and for service safety. The raw call audio is not archived as a sound file.',
        'Payments go through Stripe. Callastral does not store the full card number. Stripe returns the payment status, a transaction id and, if you entered one, billing contact details.',
        'First-visit cookies: cl_ft (90 days) stores utm_source, utm_medium, utm_campaign, the referrer and the landing page. cl_vid (12 months) is a random id used to count unique visitors. They are set on the first visit, excluding /admin and known bots, and they are not used for advertising. The cl_ck cookie stores your choice and is strictly necessary.',
        'Vercel Analytics and Vercel Speed Insights, only if you accept audience measurement.',
        'Email via Resend: account messages, password reset, consultation summary, and one reminder if a payment is started and not finished. That reminder includes an unsubscribe link.',
      ]),
      block('Purposes and legal bases', [
        'Contract: creating the account, computing the chart, running the call, taking payment, delivering a summary or report you asked for.',
        'Legal obligation: accounting and lawful requests from authorities.',
        'Consent: Vercel Analytics and Speed Insights. You can withdraw that consent at any time from the Cookies link.',
        'Legitimate interest: cl_vid and cl_ft cookies, to see which pages and campaigns lead to an account or a payment, service security, abuse limits, and one payment-reminder email with an unsubscribe link.',
      ]),
      block('Retention', [
        'Account data, the birth chart and transcripts are kept for the life of the account, then deleted or anonymised after an erasure request, subject to legal retention for invoices.',
        'Measurement cookies expire at the latest on the periods above. The consent cookie cl_ck is kept for 6 months.',
        'Technical security logs are kept only as long as needed to detect abuse, and are not a marketing profile.',
      ]),
      block('Processors', [
        'Vercel: application hosting, and audience measurement only after consent.',
        'Supabase: database, schema callastral, reachable only with a server key.',
        'Stripe: payments.',
        'xAI: the advisor’s voice during the call, and drafting of report texts you request.',
        'Resend: transactional email.',
        'These providers may process data outside the European Union. Transfers rely on their standard contractual clauses where required. Processing locations are those each provider publishes.',
      ]),
      block('Cookies', [
        'No measurement cookie is set before a choice. Accept, Refuse and Customise have the same visual weight.',
        'Refusing leaves the site usable. Page views are still counted without a cookie and without a cl_vid. Payment, the account and the call do not depend on this choice.',
      ]),
      block('Your rights', [
        'You may request access, rectification, erasure, restriction, portability and objection, and you may withdraw consent, by writing to the contact address.',
        'You may also lodge a complaint with your local data protection authority. In France, that authority is the CNIL (cnil.fr).',
      ]),
      featureNotice('en'),
      block('Contact', [
        `Write to ${legal.email}. If the address is still a bracketed marker, it has not been configured yet.`,
      ]),
    ],
  };
}

function spanish(legal: LegalIdentity): PrivacyDocument {
  return {
    title: 'Política de privacidad y RGPD',
    description:
      'Cuenta, datos de nacimiento, llamadas, pagos con Stripe, cookies cl_vid y cl_ft, finalidades, plazos, derechos y contacto.',
    sections: [
      block('Responsable', [
        `El responsable del tratamiento es ${legal.entity}${legal.idMissing ? '' : ` (${legal.id})`}, ${legal.address}.`,
        'Mientras estos datos no estén en la configuración del sitio, aparecen entre corchetes. No son datos jurídicos inventados.',
        `Para ejercer sus derechos: ${legal.email}.`,
      ]),
      block('Datos recogidos', [
        'Cuenta: correo, nombre, contraseña guardada como huella, y la cookie httpOnly de sesión lunara_session.',
        'Datos de nacimiento: fecha, hora (o el hecho de que se desconoce) y lugar, para calcular la carta natal con Swiss Ephemeris. La herramienta gratuita de ascendente no crea cuenta ni guarda el instante de nacimiento.',
        'Llamadas y voz: la voz se trata en tiempo real. Puede conservarse una transcripción de texto para el resumen escrito solicitado y para la seguridad del servicio. El audio bruto no se archiva como archivo de sonido.',
        'Pagos a través de Stripe. Callastral no guarda el número completo de la tarjeta. Stripe devuelve el estado del pago, un identificador y, si lo indicó, un contacto de facturación.',
        'Cookies de la primera visita: cl_ft (90 días) guarda utm_source, utm_medium, utm_campaign, el referente y la página de llegada. cl_vid (12 meses) es un identificador aleatorio para contar visitantes únicos. Se colocan en la primera visita, salvo /admin y los robots conocidos, y no sirven para publicidad. La cookie cl_ck guarda su elección y es estrictamente necesaria.',
        'Vercel Analytics y Vercel Speed Insights, solo si acepta la medición de audiencia.',
        'Correos con Resend: cuenta, restablecimiento de contraseña, resumen de la consulta, y un solo recordatorio si un pago se inicia y no se termina. Ese recordatorio incluye un enlace de baja.',
      ]),
      block('Finalidades y bases jurídicas', [
        'Contrato: crear la cuenta, calcular la carta, realizar la llamada, cobrar y entregar el resumen o informe pedido.',
        'Obligación legal: contabilidad y requerimientos fundados de las autoridades.',
        'Consentimiento: Vercel Analytics y Speed Insights. Puede retirarlo en cualquier momento desde el enlace Cookies.',
        'Interés legítimo: cookies cl_vid y cl_ft para saber qué páginas y campañas llevan a una cuenta o a un pago, seguridad, límite de abusos, y un solo correo de recordatorio de pago con enlace de baja.',
      ]),
      block('Conservación', [
        'Los datos de la cuenta, la carta natal y las transcripciones se conservan mientras exista la cuenta y se suprimen o anonimizan tras una solicitud de supresión, salvo la conservación legal de las facturas.',
        'Las cookies de medición caducan como máximo en los plazos indicados. La cookie de consentimiento cl_ck se conserva 6 meses.',
        'Los registros técnicos de seguridad se conservan el tiempo necesario para detectar abusos, sin perfil comercial.',
      ]),
      block('Encargados', [
        'Vercel: alojamiento y, solo tras el consentimiento, medición de audiencia.',
        'Supabase: base de datos, esquema callastral, accesible solo con una clave de servidor.',
        'Stripe: pagos.',
        'xAI: voz del consejero durante la llamada y redacción de los informes solicitados.',
        'Resend: correo transaccional.',
        'Estos proveedores pueden tratar datos fuera de la Unión Europea. Las transferencias se apoyan en sus cláusulas contractuales tipo cuando son necesarias.',
      ]),
      block('Cookies', [
        'No se deposita ninguna cookie de medición antes de una elección. Aceptar, Rechazar y Personalizar tienen el mismo peso visual.',
        'Rechazar deja el sitio utilizable. Las páginas vistas se cuentan sin cookie y sin cl_vid. El pago, la cuenta y la llamada no dependen de esta elección.',
      ]),
      block('Sus derechos', [
        'Puede solicitar acceso, rectificación, supresión, limitación, portabilidad y oposición, y retirar un consentimiento, escribiendo a la dirección de contacto.',
        'También puede reclamar ante la autoridad de protección de datos de su país. En Francia es la CNIL (cnil.fr).',
      ]),
      featureNotice('es'),
      block('Contacto', [
        `Escriba a ${legal.email}. Si la dirección sigue siendo un marcador entre corchetes, aún no está configurada.`,
      ]),
    ],
  };
}

function german(legal: LegalIdentity): PrivacyDocument {
  return {
    title: 'Datenschutzerklärung und DSGVO',
    description:
      'Konto, Geburtsdaten, Anrufe, Stripe-Zahlungen, Cookies cl_vid und cl_ft, Zwecke, Fristen, Rechte und Kontakt.',
    sections: [
      block('Verantwortlicher', [
        `Verantwortlicher ist ${legal.entity}${legal.idMissing ? '' : ` (${legal.id})`}, ${legal.address}.`,
        'Solange diese Angaben nicht in der Konfiguration stehen, bleiben sie in Klammern. Es sind keine erfundenen Rechtsangaben.',
        `Für Ihre Rechte: ${legal.email}.`,
      ]),
      block('Erhobene Daten', [
        'Konto: E-Mail, Vorname, Passwort als Hash, und das httpOnly-Sitzungscookie lunara_session.',
        'Geburtsdaten: Datum, Uhrzeit (oder der Hinweis, dass sie unbekannt ist) und Ort, für die Berechnung des Geburtshoroskops mit Swiss Ephemeris. Das kostenlose Aszendent-Werkzeug legt kein Konto an und speichert den Geburtszeitpunkt nicht.',
        'Anrufe und Stimme: Die Stimme wird in Echtzeit verarbeitet. Eine Textabschrift kann für die gewünschte schriftliche Zusammenfassung und für die Sicherheit des Dienstes aufbewahrt werden. Das Rohaudio wird nicht als Tondatei archiviert.',
        'Zahlungen laufen über Stripe. Callastral speichert nicht die vollständige Kartennummer. Stripe übermittelt den Zahlungsstatus, eine Transaktionskennung und, falls angegeben, eine Rechnungskontaktangabe.',
        'Cookies des ersten Besuchs: cl_ft (90 Tage) speichert utm_source, utm_medium, utm_campaign, den Referrer und die Einstiegsseite. cl_vid (12 Monate) ist eine zufällige Kennung, um eindeutige Besucher zu zählen. Sie werden beim ersten Besuch gesetzt, außer auf /admin und bei bekannten Bots, und nicht für Werbung verwendet. Das Cookie cl_ck speichert Ihre Wahl und ist unbedingt erforderlich.',
        'Vercel Analytics und Vercel Speed Insights nur, wenn Sie die Reichweitenmessung akzeptieren.',
        'E-Mails über Resend: Konto, Passwortzurücksetzung, Beratungszusammenfassung und eine Erinnerung, wenn eine Zahlung begonnen und nicht abgeschlossen wurde. Die Erinnerung enthält einen Abmeldelink.',
      ]),
      block('Zwecke und Rechtsgrundlagen', [
        'Vertrag: Konto, Horoskopberechnung, Anruf, Zahlung, angeforderte Zusammenfassung oder Bericht.',
        'Rechtliche Pflicht: Buchhaltung und begründete Behördenersuchen.',
        'Einwilligung: Vercel Analytics und Speed Insights. Sie können die Einwilligung jederzeit über den Link Cookies widerrufen.',
        'Berechtigtes Interesse: Cookies cl_vid und cl_ft, um zu sehen, welche Seiten und Kampagnen zu einem Konto oder einer Zahlung führen, Sicherheit, Missbrauchsschutz und eine Zahlungserinnerung mit Abmeldelink.',
      ]),
      block('Speicherdauer', [
        'Kontodaten, Geburtshoroskop und Abschriften bleiben für die Lebensdauer des Kontos und werden nach einem Löschverlangen gelöscht oder anonymisiert, vorbehaltlich gesetzlicher Aufbewahrung von Rechnungen.',
        'Mess-Cookies enden spätestens nach den genannten Fristen. Das Einwilligungs-Cookie cl_ck bleibt 6 Monate.',
        'Technische Sicherheitsprotokolle bleiben nur so lange, wie es zur Erkennung von Missbrauch nötig ist, ohne Werbeprofil.',
      ]),
      block('Auftragsverarbeiter', [
        'Vercel: Hosting und, nur nach Einwilligung, Reichweitenmessung.',
        'Supabase: Datenbank, Schema callastral, nur mit einem Serverschlüssel erreichbar.',
        'Stripe: Zahlungen.',
        'xAI: Stimme des Beraters während des Anrufs und Entwurf angeforderter Berichtstexte.',
        'Resend: Transaktions-E-Mails.',
        'Diese Anbieter können Daten außerhalb der Europäischen Union verarbeiten. Übermittlungen stützen sich auf ihre Standardvertragsklauseln, soweit erforderlich.',
      ]),
      block('Cookies', [
        'Vor einer Wahl wird kein Mess-Cookie gesetzt. Akzeptieren, Ablehnen und Anpassen haben dasselbe visuelle Gewicht.',
        'Ablehnen lässt die Website nutzbar. Seitenaufrufe werden ohne Cookie und ohne cl_vid gezählt. Zahlung, Konto und Anruf hängen nicht von dieser Wahl ab.',
      ]),
      block('Ihre Rechte', [
        'Sie können Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit und Widerspruch verlangen und eine Einwilligung widerrufen, indem Sie an die Kontaktadresse schreiben.',
        'Sie können sich auch bei der Datenschutzbehörde Ihres Landes beschweren. In Frankreich ist das die CNIL (cnil.fr).',
      ]),
      featureNotice('de'),
      block('Kontakt', [
        `Schreiben Sie an ${legal.email}. Steht die Adresse noch als Marker in Klammern, ist sie nicht konfiguriert.`,
      ]),
    ],
  };
}

function italian(legal: LegalIdentity): PrivacyDocument {
  return {
    title: 'Informativa privacy e GDPR',
    description:
      'Account, dati di nascita, chiamate, pagamenti Stripe, cookie cl_vid e cl_ft, finalità, conservazione, diritti e contatto.',
    sections: [
      block('Titolare', [
        `Il titolare del trattamento è ${legal.entity}${legal.idMissing ? '' : ` (${legal.id})`}, ${legal.address}.`,
        'Finché questi dati non sono nella configurazione del sito, restano tra parentesi. Non sono dati legali inventati.',
        `Per esercitare i diritti: ${legal.email}.`,
      ]),
      block('Dati raccolti', [
        'Account: e-mail, nome, password conservata come impronta, e il cookie di sessione httpOnly lunara_session.',
        'Dati di nascita: data, ora (o il fatto che è sconosciuta) e luogo, per calcolare il tema natale con Swiss Ephemeris. Lo strumento gratuito dell’ascendente non crea un account e non registra l’istante di nascita.',
        'Chiamate e voce: la voce è trattata in tempo reale. Una trascrizione testuale può essere conservata per il riassunto scritto richiesto e per la sicurezza del servizio. L’audio grezzo non è archiviato come file sonoro.',
        'I pagamenti passano da Stripe. Callastral non conserva il numero completo della carta. Stripe restituisce lo stato del pagamento, un identificativo e, se indicato, un contatto di fatturazione.',
        'Cookie della prima visita: cl_ft (90 giorni) memorizza utm_source, utm_medium, utm_campaign, il referrer e la pagina di arrivo. cl_vid (12 mesi) è un identificativo casuale per contare i visitatori unici. Vengono impostati alla prima visita, escluse /admin e i bot noti, e non servono alla pubblicità. Il cookie cl_ck memorizza la scelta ed è strettamente necessario.',
        'Vercel Analytics e Vercel Speed Insights solo se accetti la misurazione dell’audience.',
        'E-mail tramite Resend: account, reimpostazione della password, riassunto della consultazione, e un solo promemoria se un pagamento è iniziato e non concluso. Il promemoria include un link di disiscrizione.',
      ]),
      block('Finalità e basi giuridiche', [
        'Contratto: creare l’account, calcolare il tema, svolgere la chiamata, incassare e consegnare il riassunto o il rapporto richiesto.',
        'Obbligo legale: contabilità e richieste fondate delle autorità.',
        'Consenso: Vercel Analytics e Speed Insights. Puoi revocarlo in qualsiasi momento dal link Cookie.',
        'Interesse legittimo: cookie cl_vid e cl_ft per sapere quali pagine e campagne portano a un account o a un pagamento, sicurezza, limite degli abusi, e una sola e-mail di promemoria con disiscrizione.',
      ]),
      block('Conservazione', [
        'I dati dell’account, il tema natale e le trascrizioni restano per la vita dell’account, poi sono cancellati o anonimizzati dopo una richiesta di cancellazione, salvo la conservazione legale delle fatture.',
        'I cookie di misurazione scadono al più tardi nei termini indicati. Il cookie di consenso cl_ck resta 6 mesi.',
        'I log tecnici di sicurezza restano solo il tempo necessario a rilevare abusi, senza un profilo commerciale.',
      ]),
      block('Responsabili del trattamento', [
        'Vercel: hosting e, solo dopo il consenso, misurazione dell’audience.',
        'Supabase: database, schema callastral, accessibile solo con una chiave server.',
        'Stripe: pagamenti.',
        'xAI: voce del consulente durante la chiamata e stesura dei testi dei rapporti richiesti.',
        'Resend: e-mail transazionali.',
        'Questi fornitori possono trattare dati fuori dall’Unione europea. I trasferimenti si appoggiano alle loro clausole contrattuali tipo quando sono richieste.',
      ]),
      block('Cookie', [
        'Nessun cookie di misurazione viene depositato prima di una scelta. Accetta, Rifiuta e Personalizza hanno lo stesso peso visivo.',
        'Rifiutare lascia il sito utilizzabile. Le pagine viste sono contate senza cookie e senza cl_vid. Pagamento, account e chiamata non dipendono da questa scelta.',
      ]),
      block('I tuoi diritti', [
        'Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opposizione, e revocare un consenso, scrivendo all’indirizzo di contatto.',
        'Puoi anche proporre reclamo all’autorità di protezione dei dati del tuo paese. In Francia è la CNIL (cnil.fr).',
      ]),
      featureNotice('it'),
      block('Contatto', [
        `Scrivi a ${legal.email}. Se l’indirizzo è ancora un segnaposto tra parentesi, non è stato configurato.`,
      ]),
    ],
  };
}

const BUILDERS: Record<Locale, (legal: LegalIdentity) => PrivacyDocument> = {
  fr: french,
  en: english,
  es: spanish,
  de: german,
  it: italian,
};

export function privacyDocument(locale: Locale, legal: LegalIdentity): PrivacyDocument {
  return BUILDERS[locale](legal);
}

export function privacyPath(locale: Locale): string {
  return `/${locale}/confidentialite`;
}
