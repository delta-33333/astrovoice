export const AVIS_PATH = '/fr/avis-callastral';

export const AVIS_TITLE = "Avis Callastral : calcul d'ascendant gratuit et astrologie IA";

export const AVIS_DESCRIPTION =
  "Avis Callastral : calcul d'ascendant gratuit sans inscription, consultations d'astrologie IA par téléphone. Page éditée par Callastral.";

export const AVIS_KEYWORDS = [
  'Callastral',
  'avis Callastral',
  'calcul ascendant gratuit',
  'astrologie IA',
  'consultation astrologue téléphone',
  'thème natal en ligne',
] as const;

export const AVIS_EDITORIAL = 'Page éditée par Callastral.';

export const AVIS_FAQS = [
  {
    question: 'Le calcul d’ascendant est-il gratuit ?',
    answer:
      'Le calcul est gratuit. Les consultations se paient par formule hebdomadaire. Un appel de 3 minutes est offert une fois. Le tarif est affiché avant le paiement.',
  },
  {
    question: 'Les conseillers sont-ils des personnes réelles ?',
    answer:
      'Non. Ce sont des personas d’IA, par exemple Esther Owens. La consultation téléphonique se fait avec ces voix virtuelles, pas avec un astrologue humain.',
  },
  {
    question: 'Le résultat est-il exact ?',
    answer:
      'Le calcul utilise les éphémérides du zodiaque tropical. Il dépend de l’heure de naissance : sans l’heure exacte et le lieu, l’ascendant ne peut pas être déterminé.',
  },
] as const;

export const AVIS_STRENGTHS = [
  'Gratuit, rapide, sans inscription',
  'Transparence sur les prix et sur l’IA',
  'Disponible 24 h/24',
] as const;

export const AVIS_CAUTIONS = [
  'Les consultations sont menées par une IA',
  'L’heure de naissance exacte est nécessaire',
  'Divertissement uniquement',
] as const;

export function avisJsonLd(origin: string): Record<string, unknown> {
  const url = `${origin}${AVIS_PATH}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${origin}/fr` },
          { '@type': 'ListItem', position: 2, name: AVIS_TITLE, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        name: AVIS_TITLE,
        url,
        description: AVIS_DESCRIPTION,
        inLanguage: 'fr-FR',
        isPartOf: { '@id': `${origin}/#website` },
        publisher: { '@id': `${origin}/#organization` },
        author: { '@type': 'Organization', name: 'Callastral' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: AVIS_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}
