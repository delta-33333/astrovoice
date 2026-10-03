import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { subscriptionVoiceAllowance } from '@/lib/subscriptions';

export async function GET() {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const allowance = await subscriptionVoiceAllowance(user.id);
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || (user.username?.includes('@') ? user.username : ''),
        displayName: user.display_name,
        hasPassword: Boolean(user.password_hash),
        hasBirthData: !!user.birth_date,
        favoriteAstrologerId: user.favorite_astrologer_id,
        prepaidSeconds: user.prepaid_seconds,
        consentAcceptedAt: user.consent_accepted_at,
        subscription: allowance
          ? { entitled: allowance.entitled, seconds: allowance.seconds }
          : { entitled: false, seconds: 0 },
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
