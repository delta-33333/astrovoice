'use server';

import { revalidatePath } from 'next/cache';
import { adminAuthenticated, adminConfigured } from './admin-auth';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateAdvisorAction(formData: FormData): Promise<void> {
  if (!adminConfigured() || !(await adminAuthenticated()) || !supabaseAvailable) return;
  const id = String(formData.get('id') || '');
  const capacity = Number(formData.get('daily_capacity'));
  const bio = String(formData.get('bio') || '').slice(0, 2000);
  const years = Number(formData.get('years_experience'));
  const priceEuros = Number(formData.get('price_per_min'));
  const priceCents = Math.round(priceEuros * 100);
  if (!UUID_RE.test(id) || !Number.isInteger(capacity) || capacity < 1 || capacity > 24) return;
  if (!Number.isInteger(years) || years < 1 || years > 45) return;
  if (!Number.isInteger(priceCents) || priceCents < 50 || priceCents > 200) return;
  const admin = getSupabaseAdmin();
  const base = {
    active: formData.get('active') === '1',
    featured: formData.get('featured') === '1',
    daily_capacity: capacity,
    bio,
  };
  let { error } = await admin
    .from('advisors')
    .update({
      ...base,
      years_experience: years,
      price_per_min_cents: priceCents,
    })
    .eq('id', id);
  if (error && (error.code === '42703' || error.code === 'PGRST204' || /does not exist/i.test(error.message))) {
    ({ error } = await admin.from('advisors').update(base).eq('id', id));
  }
  if (error) console.error('Mise à jour conseiller:', error.message);
  revalidatePath('/admin/advisors');
}
