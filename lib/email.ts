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

export function recipientEmail(user: { email?: string | null; username?: string | null }): string | null {
  const candidates = [user.email, user.username];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && value.includes('@') && !value.endsWith('@placeholder.com')) return value;
  }
  return null;
}
