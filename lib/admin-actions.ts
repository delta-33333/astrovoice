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
  if (!UUID_RE.test(id) || !Number.isInteger(capacity) || capacity < 1 || capacity > 24) return;
  const { error } = await getSupabaseAdmin()
    .from('advisors')
    .update({
      active: formData.get('active') === '1',
      featured: formData.get('featured') === '1',
      daily_capacity: capacity,
      bio,
    })
    .eq('id', id);
  if (error) console.error('Mise à jour conseiller:', error.message);
  revalidatePath('/admin/advisors');
}
