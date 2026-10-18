/**
 * Extrait de 25 secondes pour la page d’accueil.
 * Persona : Léa Durand, conseillère virtuelle. Le thème cité est un exemple fictif, étiqueté comme tel.
 * La voix est une synthèse, jamais un enregistrement humain.
 *
 * Sans XAI_API_KEY, le script ne contacte aucun réseau et laisse public/samples/sample-fr.mp3
 * et sample-en.mp3 en place. Le temps réel vocal ne dépose pas de fichier audio :
 * ce script ne lance donc pas d’appel facturé.
 */
const LINES = {
  fr: 'Extrait généré par IA. Voix de synthèse Callastral. Je suis Léa Durand, conseillère virtuelle. Cet extrait est un exemple, sur un thème fictif.',
  en: 'AI-generated excerpt. Callastral synthetic voice. I am Léa Durand, a virtual advisor. This excerpt is an example, on a fictional chart.',
} as const;

const key = process.env.XAI_API_KEY?.trim();
if (!key) {
  console.log('XAI_API_KEY absent. Les extraits déjà publiés restent en place.');
  console.log(LINES.fr);
  console.log(LINES.en);
  process.exit(0);
}

console.log('Clé présente. Aucun appel n’est lancé : le temps réel ne produit pas les fichiers mp3.');
console.log(LINES.fr);
console.log(LINES.en);
process.exit(0);
