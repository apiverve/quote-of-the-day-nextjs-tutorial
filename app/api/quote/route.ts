import { callApi, fromCache, guard, respond, toCache } from '@/lib/apiverve';

// The quote of the day is fetched once and then served from the cache until the date changes,
// so everyone opening the page that day sees the same quote at no extra cost.
// ?fresh=1 asks for a new random quote; that one is never cached and counts against the rate limit.
const DAY_MS = 24 * 60 * 60_000;

type Quote = { quote: string; author: string };

/** GET /api/quote: today's quote. GET /api/quote?fresh=1: a new random one. */
export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.get('fresh') === '1';
  const today = new Date().toISOString().slice(0, 10);
  const key = `quote:${today}`;

  if (!fresh) {
    const hit = fromCache<Quote & { date: string }>(key, DAY_MS);
    if (hit) return Response.json(hit);
  }

  const blocked = guard(request);
  if (blocked) return blocked;

  return respond(async () => {
    const data = await callApi<Quote>('randomquote');
    if (fresh) return { ...data, date: null };
    const daily = { ...data, date: today };
    toCache(key, daily);
    return daily;
  });
}
