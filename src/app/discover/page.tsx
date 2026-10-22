import Link from 'next/link';
import type { Metadata } from 'next';
import { approvedExternalGames } from '@/data/external-games';

export const metadata: Metadata = {
  title: 'Discover Open-Source Games | GameVado',
  description: 'Discover selected independent and open-source games, including official websites and downloads.',
  robots: { index: approvedExternalGames.length > 0, follow: true },
};

export default function DiscoverPage() {
  return <main className="container" style={{paddingTop:40,paddingBottom:80}}>
    <h1>Discover More Games</h1>
    <p className="muted">Explore independently hosted games and official download pages. External links open their creators’ websites.</p>
    {approvedExternalGames.length===0
      ? <p className="muted">Our next collection is being reviewed. Check back soon.</p>
      : <div className="grid-cards">{approvedExternalGames.map(game=><article key={game.slug} style={{padding:24,border:'1px solid #394456',borderRadius:16}}>
          <h2>{game.title}</h2><p>{game.description}</p><p className="muted">{game.platforms.join(' · ')}</p>
          <Link href={`/discover/${game.slug}`}>View game details →</Link>
        </article>)}</div>}
  </main>;
}
