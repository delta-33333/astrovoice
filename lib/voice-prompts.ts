import { AI_ACT_SPOKEN, AI_ACT_SPOKEN_FEMININE } from './legal';
import { silenceRule } from './voice-silence';
import type { BirthData, NatalChart, VoiceId } from './types';

const VOICES: readonly VoiceId[] = ['ara', 'eve', 'leo', 'rex', 'sal'];

function trimNatalChart(chart: NatalChart): string {
  const summary = {
    planets: (chart.planets ?? []).slice(0, 10).map((p) => ({
      name: p.name,
      sign: p.sign,
      house: p.house,
      degree: Math.round(p.degree),
    })),
    houses: (chart.houses ?? []).slice(0, 4).map((h) => ({
      num: h.number,
      sign: h.sign,
    })),
    aspects: (chart.aspects ?? []).slice(0, 8).map((a) => ({
      p1: a.planet1,
      p2: a.planet2,
      type: a.type,
    })),
  };
  return JSON.stringify(summary);
}

const CLIENT_BLOCK: Record<string, (name: string, birth: string, place: string, timeNote: string) => string> = {
  fr: (name, birth, place, timeNote) =>
    `Personne en consultation\nPrénom : ${name}\nNaissance : ${birth}\nLieu : ${place}\n${timeNote}\nParle français.`,
  en: (name, birth, place, timeNote) =>
    `Person in consultation\nFirst name: ${name}\nBirth: ${birth}\nPlace: ${place}\n${timeNote}\nSpeak English.`,
  es: (name, birth, place, timeNote) =>
    `Persona en consulta\nNombre: ${name}\nNacimiento: ${birth}\nLugar: ${place}\n${timeNote}\nHabla español.`,
  de: (name, birth, place, timeNote) =>
    `Person in der Beratung\nVorname: ${name}\nGeburt: ${birth}\nOrt: ${place}\n${timeNote}\nSprich Deutsch.`,
  it: (name, birth, place, timeNote) =>
    `Persona in consulenza\nNome: ${name}\nNascita: ${birth}\nLuogo: ${place}\n${timeNote}\nParla italiano.`,
};

const TIME_UNKNOWN: Record<string, string> = {
  fr: "Heure inconnue : ne t'appuie pas sur l'Ascendant ni sur les maisons ; reste sur le Soleil et la Lune.",
  en: 'Birth time unknown: do not rely on the Ascendant or the houses; stay with the Sun and the Moon.',
  es: 'Hora desconocida: no te apoyes en el Ascendente ni en las casas; quédate con el Sol y la Luna.',
  de: 'Geburtszeit unbekannt: stütze dich nicht auf den Aszendenten oder die Häuser; bleib bei Sonne und Mond.',
  it: "Ora sconosciuta: non appoggiarti all'Ascendente né alle case; resta su Sole e Luna.",
};

export function asVoiceId(value: string | null | undefined): VoiceId {
  return value && VOICES.includes(value as VoiceId) ? (value as VoiceId) : 'ara';
}

export function getVoiceSystemPrompt(
  advisor: {
    firstName: string;
    lastName: string;
    personaPrompt: string;
    languages: string[];
    gender?: 'femme' | 'homme' | null;
  },
  birthData: BirthData,
  natalChart: NatalChart
): string {
  const lang = advisor.languages[0] || 'fr';
  const block = CLIENT_BLOCK[lang] ?? CLIENT_BLOCK.fr;
  const birth = `${birthData.date}${birthData.time ? ` ${birthData.time}` : ''}`;
  const timeNote = birthData.timeUnknown ? TIME_UNKNOWN[lang] ?? TIME_UNKNOWN.fr : '';
  const client = block(birthData.name, birth, birthData.place, timeNote);

  const chartLabel: Record<string, string> = {
    fr: 'Thème (résumé)',
    en: 'Chart (summary)',
    es: 'Carta (resumen)',
    de: 'Horoskop (Kurzfassung)',
    it: 'Tema (riassunto)',
  };
  const spokenSet = advisor.gender === 'femme' ? AI_ACT_SPOKEN_FEMININE : AI_ACT_SPOKEN;
  const spoken = spokenSet[lang as keyof typeof AI_ACT_SPOKEN] ?? spokenSet.fr;
  const opening: Record<string, string> = {
    fr: `Ouverture obligatoire. Ta toute première phrase, avant toute salutation, est exactement : « ${spoken} » Ensuite seulement, poursuis.`,
    en: `Mandatory opening. Your very first sentence, before any greeting, is exactly: "${spoken}" Only then continue.`,
    es: `Apertura obligatoria. Tu primera frase, antes de cualquier saludo, es exactamente: « ${spoken} » Solo después continúas.`,
    de: `Pflicht am Anfang. Dein allererster Satz, vor jeder Begrüßung, lautet genau: „${spoken}“ Erst danach sprichst du weiter.`,
    it: `Apertura obbligatoria. La tua primissima frase, prima di qualsiasi saluto, è esattamente: « ${spoken} » Solo dopo prosegui.`,
  };

  const chartText = natalChart.voiceSummary?.trim() || trimNatalChart(natalChart);

  return `${opening[lang] ?? opening.fr}

${advisor.personaPrompt}

${silenceRule(lang)}

${client}

${chartLabel[lang] ?? chartLabel.fr} :
${chartText}`;
}
