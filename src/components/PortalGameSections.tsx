import Link from 'next/link';
import type {Game} from '@/data/games';
import GameCard from './GameCard';

export default function PortalGameSections({games, locale='en'}:{games:Game[];locale?:'en'|'zh-CN'}) {
  const zh=locale==='zh-CN', prefix=zh?'/zh':'';
  const multiplayer=games.filter(game=>game.categories?.includes('2 Player'));
  const arcade=games.filter(game=>['galaxy-strike','neon-runner','fruit-slash','breakout','snake','pong'].includes(game.slug));
  return <>
    <section style={{marginTop:42}}><div className="section-heading"><div><span className="eyebrow">{zh?'本地多人':'LOCAL MULTIPLAYER'}</span><h2>{zh?'同屏双人游戏':'Play Together on One Keyboard'}</h2></div><Link href={`${prefix}/category/2-player`}>{zh?'全部双人游戏':'All 2 Player games'}</Link></div><div className="grid-cards">{multiplayer.map(game=><GameCard key={game.id} game={game} locale={locale}/>)}</div></section>
    <section style={{marginTop:42}}><div className="section-heading"><div><span className="eyebrow">{zh?'快速、灵敏、再来一局':'FAST, RESPONSIVE, REPLAYABLE'}</span><h2>{zh?'街机精选':'Arcade Hits'}</h2></div><Link href={`${prefix}/category/arcade`}>{zh?'全部街机游戏':'All Arcade games'}</Link></div><div className="grid-cards">{arcade.map(game=><GameCard key={game.id} game={game} locale={locale}/>)}</div></section>
  </>;
}
