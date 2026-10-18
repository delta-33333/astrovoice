interface MailAttachment {
  filename: string;
  content: string;
}

function resendFrom(): string {
  const raw = (process.env.RESEND_FROM || '').trim();
  if (!raw) return 'Callastral <noreply@callastral.com>';
  if (raw.includes('<')) return raw;
  return `Callastral <${raw}>`;
}

interface MailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
  headers?: Record<string, string>;
  /** Envoi différé Resend (ISO 8601). Compatible avec un hébergement sans cron horaire. */
  scheduledAt?: string;
}

export async function sendMail(input: MailInput): Promise<boolean> {
  const id = await dispatchMail(input);
  return Boolean(id);
}

/** Identifiant Resend, ou null si l’envoi n’a pas été accepté. */
export async function dispatchMail(input: MailInput): Promise<string | null> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn('RESEND_API_KEY absente : e-mail non envoyé');
    return null;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFrom(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.scheduledAt ? { scheduled_at: input.scheduledAt } : {}),
      ...(input.headers ? { headers: input.headers } : {}),
      ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Envoi e-mail refusé:', response.status, detail.slice(0, 300));
    return null;
  }
  const payload = (await response.json().catch(() => null)) as { id?: string } | null;
  return payload?.id || null;
}

/** Envoie par paquets de 100. S’arrête au premier refus et renvoie le nombre accepté. */
export async function dispatchBatch(inputs: MailInput[]): Promise<number> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || !inputs.length) return 0;
  let sent = 0;
  for (let index = 0; index < inputs.length; index += 100) {
    const chunk = inputs.slice(index, index + 100);
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        chunk.map((input) => ({
          from: resendFrom(),
          to: [input.to],
          subject: input.subject,
          html: input.html,
          ...(input.headers ? { headers: input.headers } : {}),
        }))
      ),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('Envoi groupé refusé:', response.status, detail.slice(0, 300));
      return sent;
    }
    sent += chunk.length;
  }
  return sent;
}

export async function cancelScheduledMail(emailId: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || !emailId) return false;
  const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(emailId)}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    const detail = await response.text();
    console.warn('Annulation e-mail refusée:', response.status, detail.slice(0, 200));
    return false;
  }
  return true;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendPasswordResetMail(to: string, name: string, link: string): Promise<boolean> {
  return sendMail({
    to,
    subject: 'Réinitialisation de votre mot de passe Callastral',
    html: `<p>Bonjour ${escapeHtml(name || '')},</p>
<p>Vous avez demandé à choisir un nouveau mot de passe. Ce lien est valable 1 heure et ne peut servir qu’une fois.</p>
<p><a href="${escapeHtml(link)}">Choisir un nouveau mot de passe</a></p>
<p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail. Votre accès actuel reste inchangé.</p>`,
  });
}

export function recipientEmail(user: { email?: string | null; username?: string | null }): string | null {
  const candidates = [user.email, user.username];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && value.includes('@') && !value.endsWith('@placeholder.com')) return value;
  }
  return null;
}
