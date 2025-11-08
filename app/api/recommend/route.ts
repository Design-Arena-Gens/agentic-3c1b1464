import { NextResponse } from 'next/server';
import companies from '../../../data/companies.json';
import { rankCompanies } from '../../../lib/scoring';
import { UserPreferences } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<UserPreferences>;
    const prefs: UserPreferences = {
      riskTolerance: (body.riskTolerance ?? 'medium') as UserPreferences['riskTolerance'],
      preferredSectors: Array.isArray(body.preferredSectors) ? (body.preferredSectors as string[]) : [],
      includeLargeCaps: Boolean(body.includeLargeCaps ?? false),
    };

    const results = rankCompanies(companies as any, prefs, 7);

    return NextResponse.json({ results, disclaimer: DISCLAIMER });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Invalid request' }, { status: 400 });
  }
}

const DISCLAIMER = `Yah tool shiksha uddeshya ke liye hai. Yah koi financial salah nahi hai. Bazaar jokhim ke adheen hai.`;
