import 'server-only';
import { isMissingRelation } from './missing-relation';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import { isCoupleId, toPublicCoupleResult, type PublicCoupleResult } from './couple-compat';
import { isLocale, type Locale } from './seo';

export type { PublicCoupleResult };

export async function saveCoupleResult(input: {
  locale: Locale;
  score: number;
  strengths: string[];
  tensions: string[];
  initialA: string;
  initialB: string;
  labelA: string | null;
  labelB: string | null;
}): Promise<PublicCoupleResult | null> {
  if (!supabaseAvailable) return null;
  const inserted = await getSupabaseAdmin()
    .from('couple_results')
    .insert({
      locale: input.locale,
      score: input.score,
      strengths: input.strengths,
      tensions: input.tensions,
      initial_a: input.initialA,
      initial_b: input.initialB,
      label_a: input.labelA,
      label_b: input.labelB,
    })
    .select('id, locale, score, strengths, tensions, initial_a, initial_b, label_a, label_b')
    .single();
  if (inserted.error || !inserted.data) {
    if (!isMissingRelation(inserted.error)) {
      console.error('Couple:', inserted.error?.message);
    }
    return null;
  }
  return rowToPublic(inserted.data);
}

export async function loadCoupleResult(id: string): Promise<PublicCoupleResult | null> {
  if (!supabaseAvailable || !isCoupleId(id)) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('couple_results')
    .select('id, locale, score, strengths, tensions, initial_a, initial_b, label_a, label_b')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    if (!isMissingRelation(error)) console.error('Couple:', error.message);
    return null;
  }
  if (!data) return null;
  return rowToPublic(data);
}

function asStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').slice(0, 4);
}

function rowToPublic(row: {
  id: string;
  locale: string;
  score: number;
  strengths: unknown;
  tensions: unknown;
  initial_a: string;
  initial_b: string;
  label_a: string | null;
  label_b: string | null;
}): PublicCoupleResult | null {
  if (!isLocale(row.locale)) return null;
  return toPublicCoupleResult({
    id: row.id,
    locale: row.locale,
    score: row.score,
    strengths: asStrings(row.strengths),
    tensions: asStrings(row.tensions),
    initialA: row.initial_a,
    initialB: row.initial_b,
    labelA: row.label_a,
    labelB: row.label_b,
  });
}
