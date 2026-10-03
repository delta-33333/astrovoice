interface MailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(input: MailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn('RESEND_API_KEY absente : e-mail non envoyé');
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Callastral <noreply@callastral.com>',
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Envoi e-mail refusé:', response.status, detail.slice(0, 300));
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
