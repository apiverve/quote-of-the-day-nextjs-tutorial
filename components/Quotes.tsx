'use client';

import { useEffect, useState } from 'react';

type Quote = { quote: string; author: string; date?: string | null };
type Result = Quote & { error?: string; code?: string };

const SAVED_KEY = 'quotes:saved';

// Each quote gets one of these gradients, picked from its text, so the same quote always looks the same.
const SKIES = [
  ['#2b1b4f', '#7a3e8f', '#f08a5d'],
  ['#0f2a43', '#1f6f8b', '#99d5c9'],
  ['#3b1d2e', '#a33b5c', '#f5b971'],
  ['#14213d', '#3a506b', '#5bc0be'],
  ['#2d1e2f', '#6d435a', '#ff9f80'],
  ['#1c2541', '#4c3f91', '#c3aed6']
];

function skyFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SKIES[h % SKIES.length];
}

const sameQuote = (a: Quote, b: Quote) => a.quote === b.quote && a.author === b.author;

export default function Quotes() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [missingKey, setMissingKey] = useState(false);
  const [saved, setSaved] = useState<Quote[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'));
    } catch {}
    load(false);
  }, []);

  async function load(fresh: boolean) {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/quote${fresh ? '?fresh=1' : ''}`);
    const data: Result = await res.json().catch(() => ({ error: 'Something went wrong' }) as Result);
    setLoading(false);
    if (data.code === 'missing_key') return setMissingKey(true);
    if (data.error) return setError(res.status === 429 ? 'That’s a lot of quotes. Take a breath and try again in a minute.' : data.error);
    setQuote(data);
    setCopied(false);
  }

  function persist(next: Quote[]) {
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {}
  }

  const isSaved = quote ? saved.some((q) => sameQuote(q, quote)) : false;
  const toggleSave = () => {
    if (!quote) return;
    const bare = { quote: quote.quote, author: quote.author };
    persist(isSaved ? saved.filter((q) => !sameQuote(q, quote)) : [bare, ...saved].slice(0, 50));
  };

  async function copy() {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(`“${quote.quote}” — ${quote.author}`);
      setCopied(true);
    } catch {}
  }

  if (missingKey) {
    return (
      <main className="stage" style={{ ['--a' as string]: SKIES[0][0], ['--b' as string]: SKIES[0][1], ['--c' as string]: SKIES[0][2] }}>
        <section className="setup">
          <p className="label">One step left</p>
          <h1>Add your API key</h1>
          <p>
            Quotes come from the APIVerve Random Quote API. Create a free key at{' '}
            <a href="https://dashboard.apiverve.com/signup?api=randomquote&utm_source=template&utm_medium=app&utm_campaign=quote-of-the-day-nextjs-tutorial">dashboard.apiverve.com</a>, set{' '}
            <code>APIVERVE_API_KEY</code> in <code>.env</code> or in your Vercel project, and reload.
          </p>
        </section>
      </main>
    );
  }

  const [a, b, c] = skyFor(quote?.quote || '');
  const dateLabel = quote?.date
    ? new Date(`${quote.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    : 'A fresh one, just for you';

  return (
    <main className="stage" style={{ ['--a' as string]: a, ['--b' as string]: b, ['--c' as string]: c }}>
      <div className="wrap">
        <header className="top">
          <span className="brand">❝ Daily Quote</span>
          <span className="label">{quote?.date ? 'Quote of the day' : 'Random quote'}</span>
        </header>

        <section className="card" aria-live="polite">
          <p className="date">{dateLabel}</p>
          {error && <p className="error">{error}</p>}
          {quote ? (
            <blockquote key={quote.quote}>
              <p className="text">{quote.quote}</p>
              <footer className="author">— {quote.author}</footer>
            </blockquote>
          ) : (
            !error && <p className="text loading">Finding today’s words…</p>
          )}
          <div className="actions">
            <button className="primary" onClick={() => load(true)} disabled={loading}>
              {loading ? 'Finding one…' : 'Another quote'}
            </button>
            <button onClick={toggleSave} aria-pressed={isSaved} disabled={!quote}>
              {isSaved ? '♥ Saved' : '♡ Save'}
            </button>
            <button onClick={copy} disabled={!quote}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        <section className="saved">
          <h2>Your collection {saved.length > 0 && <span>{saved.length}</span>}</h2>
          {saved.length === 0 ? (
            <p className="muted">Tap Save on a quote you love and it’ll be kept here, on this device.</p>
          ) : (
            <ul>
              {saved.map((q) => (
                <li key={q.quote}>
                  <button onClick={() => setQuote({ ...q, date: null })}>
                    <span className="q">“{q.quote}”</span>
                    <span className="by">{q.author}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="foot">
          Quotes from the <a href="https://apiverve.com/marketplace/randomquote?utm_source=template&utm_medium=app&utm_campaign=quote-of-the-day-nextjs-tutorial">APIVerve Random Quote API</a>
        </p>
      </div>
    </main>
  );
}
