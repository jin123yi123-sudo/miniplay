import Link from 'next/link';
import type{ArticleSection}from '@/data/match3-articles';
import {games,type Game} from '@/data/games';
import GameLoader,{type GameSlug} from '@/games/GameLoader';
import GameCard from './GameCard';
import AdPlaceholder from './AdPlaceholder';
import type{Locale}from'@/i18n/config';import{dictionaries}from'@/i18n/dictionary';
export default function Match3Page({game,article,locale='en',allGames=games}:{game:Game;article:ArticleSection[];locale?:Locale;allGames?:Game[]}){const t=dictionaries[locale],prefix=locale==='zh-CN'?'/zh':'',zh=locale==='zh-CN';return <div className="container" style={{paddingTop:24}}>
 <nav className="muted" aria-label="Breadcrumb"><Link href={`${prefix}/`}>{t.common.home}</Link> / <Link href={`${prefix}/games`}>{t.nav.games}</Link> / {game.title}</nav>
 <h1 style={{marginBottom:4}}>{game.title}</h1><p className="muted">{game.shortDescription}</p>
 <div className="card game-stage match3-stage"><GameLoader slug={game.slug as GameSlug}/></div>
 <AdPlaceholder slot="game-bottom"/>
 <section className="prose" aria-label={zh?`关于${game.title}`:`About ${game.title}`}>
  <h2>{article[0].heading}</h2>{article[0].paragraphs.map(p=><p key={p}>{p}</p>)}
  <h2>{t.common.howTo}</h2>{game.howTo.map(p=><p key={p}>{p}</p>)}<h2>{t.common.controls}</h2><p>{game.controls}</p>
  {article.slice(1).map(section=><div key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}</div>)}
  <h2>{zh?'消除策略技巧':game.slug==='gem-match'?'Match-3 Strategy Tips':'Strategy Tips'}</h2>{game.tips.map(p=><p key={p}>{p}</p>)}<h2>{t.common.aboutGame}</h2><p>{game.description} {zh?'游戏在本机浏览器中运行，无需账号。':'It runs locally in the browser with no account required.'}</p>
  <h2>{t.common.faq}</h2>{game.faq.map(f=><div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
 </section>
 <section><h2>{t.common.related}</h2><div className="grid-cards">{allGames.filter(g=>g.slug!==game.slug&&g.tags.includes('match-3')).slice(0,3).map(g=><GameCard locale={locale} key={g.id} game={g}/>)}</div></section>
 </div>}
