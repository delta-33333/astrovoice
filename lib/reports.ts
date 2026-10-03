import 'server-only';
import type Stripe from 'stripe';
import { chartAtUtcNoon, type ComputedChart } from './ephemeris';
import { loadOrComputeChart } from './natal-store';
import { escapeHtml, recipientEmail, sendMail } from './email';
import { isMissingRelation } from './missing-relation';
import { readRates } from './market';
import { convertEurCents, formatMoney, isCurrency, normalizeCurrency, type Currency } from './money';
import {
  FORECAST_YEARS,
  isReportKind,
  reportEurCents,
  reportTitle,
  type ReportKind,
} from './offers';
import { pdfFromText } from './pdf-text';
import { appBaseUrl } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import { REPORT_SYSTEM, writeProse } from './xai';

export interface ReportRow {
  id: string;
  user_id: string;
  kind: string;
  status: string;
  stripe_checkout_session_id: string | null;
  currency: string;
  amount_cents: number;
  input: Record<string, unknown>;
  chart: unknown;
  body: string | null;
  delivered_at: string | null;
  created_at: string;
}

interface BirthFields {
  name: string;
  date: string;
  time?: string;
  timeUnknown?: boolean;
  place: string;
}

function asBirth(value: unknown): BirthFields | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<BirthFields>;
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 80) : '';
  const date = typeof raw.date === 'string' ? raw.date.trim() : '';
  const place = typeof raw.place === 'string' ? raw.place.trim().slice(0, 160) : '';
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date) || place.length < 2) return null;
  const time = typeof raw.time === 'string' ? raw.time.trim().slice(0, 8) : undefined;
  return { name, date, place, time, timeUnknown: Boolean(raw.timeUnknown) || !time };
}

export function parseReportInput(kind: ReportKind, input: unknown): BirthFields | { a: BirthFields; b: BirthFields } | null {
  if (!input || typeof input !== 'object') return null;
  if (kind === 'compatibility') {
    const raw = input as { a?: unknown; b?: unknown };
    const a = asBirth(raw.a);
    const b = asBirth(raw.b);
    if (!a || !b) return null;
    return { a, b };
  }
  return asBirth(input);
}

function chartFacts(chart: ComputedChart): string {
  return JSON.stringify({
    lieu: chart.placeLabel,
    fuseau: chart.timeZone,
    instant: chart.timeUsed,
    heureConnue: chart.timeKnown,
    soleil: chart.sunSign,
    lune: chart.moonSign,
    ascendant: chart.ascendant,
    planetes: chart.planets.map((planet) => ({
      nom: planet.name,
      signe: planet.sign,
      degre: planet.degree,
      maison: planet.house,
      retrograde: Boolean(planet.retrograde),
    })),
    maisons: chart.houses.map((house) => ({
      numero: house.number,
      signe: house.sign,
      degre: house.degree,
    })),
    aspects: chart.aspects.map((aspect) => ({
      a: aspect.planet1,
      b: aspect.planet2,
      type: aspect.type,
      orbe: aspect.orb,
    })),
  });
}

async function compose(kind: ReportKind, input: BirthFields | { a: BirthFields; b: BirthFields }): Promise<{
  body: string;
  chart: unknown;
}> {
  if (kind === 'compatibility' && 'a' in input) {
    const chartA = await loadOrComputeChart(input.a);
    const chartB = await loadOrComputeChart(input.b);
    const body = await writeProse(
      REPORT_SYSTEM,
      `Rédige une lecture de compatibilité entre ${input.a.name} et ${input.b.name}.\n` +
        `Thème de ${input.a.name} : ${chartFacts(chartA)}\n` +
        `Thème de ${input.b.name} : ${chartFacts(chartB)}`
    );
    return { body, chart: { a: chartA, b: chartB } };
  }
  const birth = input as BirthFields;
  const natal = await loadOrComputeChart(birth);
  if (kind === 'forecast') {
    const skies = FORECAST_YEARS.map((year) =>
      chartAtUtcNoon(year, 1, 1, natal.coords.lat, natal.coords.lon, natal.placeLabel)
    );
    const body = await writeProse(
      REPORT_SYSTEM,
      `Rédige la prévision ${FORECAST_YEARS.join(' et ')} pour ${birth.name}.\n` +
        `Thème natal : ${chartFacts(natal)}\n` +
        skies.map((sky, index) => `Ciel du 1er janvier ${FORECAST_YEARS[index]} à midi UTC : ${chartFacts(sky)}`).join('\n')
    );
    return { body, chart: { natal, skies } };
  }
  const body = await writeProse(
    REPORT_SYSTEM,
    `Rédige le portrait du thème natal de ${birth.name}.\nThème : ${chartFacts(natal)}`
  );
  return { body, chart: natal };
}

export async function createPendingReport(options: {
  userId: string;
  kind: ReportKind;
  currency: Currency;
  amountCents: number;
  input: unknown;
}): Promise<string> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await getSupabaseAdmin()
    .from('reports')
    .insert({
      user_id: options.userId,
      kind: options.kind,
      status: 'pending',
      currency: options.currency,
      amount_cents: options.amountCents,
      input: options.input,
    })
    .select('id')
    .single();
  if (error) {
    if (isMissingRelation(error)) throw new Error('REPORTS_NOT_READY');
    throw new Error(error.message);
  }
  return data.id as string;
}

export async function attachReportCheckout(reportId: string, checkoutSessionId: string): Promise<void> {
  if (!supabaseAvailable) return;
  await getSupabaseAdmin()
    .from('reports')
    .update({ stripe_checkout_session_id: checkoutSessionId })
    .eq('id', reportId);
}

async function emailReport(row: ReportRow): Promise<boolean> {
  const { data: user } = await getSupabaseAdmin()
    .from('users')
    .select('email, username, display_name')
    .eq('id', row.user_id)
    .maybeSingle();
  if (!user) return false;
  const to = recipientEmail(user);
  if (!to) return false;
  const title = reportTitle(row.kind);
  const link = `${appBaseUrl()}/reports/${row.id}`;
  const pdf = pdfFromText(title, row.body || '');
  const paragraphs = (row.body || '')
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return sendMail({
    to,
    subject: title,
    html: `<p>Bonjour ${escapeHtml(user.display_name || '')},</p>
<p>Votre ${escapeHtml(title.toLowerCase())} est prêt. Il reste aussi dans votre compte.</p>
${paragraphs}
<p><a href="${escapeHtml(link)}">Ouvrir dans le compte</a></p>`,
    attachments: [
      {
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        content: pdf.toString('base64'),
      },
    ],
  });
}

export async function fulfillReport(reportId: string): Promise<'sent' | 'already' | 'missing' | 'wait'> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('reports').select('*').eq('id', reportId).maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return 'missing';
    throw new Error(error.message);
  }
  const row = data as ReportRow | null;
  if (!row) return 'missing';
  if (row.status === 'delivered') return 'already';
  if (!isReportKind(row.kind)) return 'wait';

  let body = row.body;
  let chart = row.chart;
  if (!body) {
    const parsed = parseReportInput(row.kind, row.input);
    if (!parsed) throw new Error('REPORT_INPUT');
    const written = await compose(row.kind, parsed);
    body = written.body;
    chart = written.chart;
    const saved = await admin
      .from('reports')
      .update({ body, chart, status: 'paid' })
      .eq('id', row.id)
      .is('body', null);
    if (saved.error) throw new Error(saved.error.message);
  }

  const fresh = { ...row, body, chart, status: 'paid' };
  const sent = await emailReport(fresh);
  if (!sent) {
    console.warn('E-mail du rapport non envoyé', row.id);
  }
  const delivered = await admin
    .from('reports')
    .update({ status: 'delivered', delivered_at: new Date().toISOString(), body })
    .eq('id', row.id);
  if (delivered.error) throw new Error(delivered.error.message);
  return 'sent';
}

export async function markReportPaid(reportId: string, checkoutSessionId: string): Promise<void> {
  if (!supabaseAvailable) return;
  const { error } = await getSupabaseAdmin()
    .from('reports')
    .update({ status: 'paid', stripe_checkout_session_id: checkoutSessionId })
    .eq('id', reportId)
    .eq('status', 'pending');
  if (error && !isMissingRelation(error)) throw new Error(error.message);
}

export async function fulfillCheckoutReport(session: Stripe.Checkout.Session): Promise<void> {
  const reportId = session.metadata?.report_id;
  if (!reportId) return;
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return;
  await markReportPaid(reportId, session.id);
  await fulfillReport(reportId);
}

export async function listReports(userId: string): Promise<Array<Pick<ReportRow, 'id' | 'kind' | 'status' | 'created_at' | 'delivered_at'>>> {
  if (!supabaseAvailable) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('reports')
    .select('id, kind, status, created_at, delivered_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) {
    if (isMissingRelation(error)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as Array<Pick<ReportRow, 'id' | 'kind' | 'status' | 'created_at' | 'delivered_at'>>;
}

export async function getOwnedReport(userId: string, reportId: string): Promise<ReportRow | null> {
  if (!supabaseAvailable) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return null;
    throw new Error(error.message);
  }
  return (data as ReportRow | null) ?? null;
}

export function chargeAmount(kind: ReportKind, currency: Currency): number {
  return convertEurCents(reportEurCents(kind), currency, readRates());
}

export function chargeCurrency(value: string | null | undefined): Currency {
  const currency = normalizeCurrency(value);
  return isCurrency(currency) ? currency : 'eur';
}
