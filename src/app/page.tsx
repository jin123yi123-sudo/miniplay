import Link from 'next/link';
import {games,categoryRegistry} from '@/data/games';
import GameCard from '@/components/GameCard';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import PortalGameSections from '@/components/PortalGameSections';
import {site} from '@/config/site';
import {localizedMetadata} from '@/i18n/metadata';

export const metadata=localizedMetadata('en','/','GameVado — Free Browser Games, No Download','Play free browser games instantly on GameVado. Enjoy puzzle, arcade, action, match-3 and strategy games with no download or sign-up required.');
export default function Home(){return <div className="container">
  <section style={{padding:'54px 0 26px'}}><span style={{color:'var(--brand)',fontWeight:800}}>NO DOWNLOADS. JUST PLAY.</span><h1 style={{fontSize:'clamp(2rem,6vw,4rem)',maxWidth:700,margin:'10px 0'}}>Quick browser games for short breaks.</h1><p className="muted" style={{fontSize:19,maxWidth:600}}>Original browser games, instant starts, and zero accounts. Pick one and make your next few minutes fun.</p><Link href="/games" className="btn">Browse all games</Link></section>
  <section><h2>Featured Games</h2><div className="grid-cards">{games.filter(g=>g.featured).slice(0,8).map(g=><GameCard key={g.id} game={g}/>)}</div></section>
  <PortalGameSections games={games}/><RecentlyPlayed/>
  <section style={{marginTop:42}}><h2>Browse Categories</h2><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{categoryRegistry.map(c=><Link className="btn secondary" href={`/category/${c.slug}`} key={c.slug}>{c.name}</Link>)}</div><p><Link href="/categories">View all categories</Link></p></section>
  <section style={{marginTop:42}}><h2>New and Quick Games</h2><div className="grid-cards">{games.filter(g=>g.isNew&&!g.tags.includes('match-3')).slice(0,6).map(g=><GameCard key={g.id} game={g}/>)}</div><p style={{marginTop:24}}><Link className="btn secondary" href="/games">See the complete collection</Link></p></section>
  <section className="prose" style={{marginTop:48}}><h2>Small games, thoughtfully made</h2><p>{site.name} is built for the moments between tasks. Every game opens directly in your browser, works with touch controls, and avoids heavy downloads. The collection mixes planning puzzles, arcade action, match-3 levels, card play, memory practice, and quick strategy.</p></section>
</div>}
