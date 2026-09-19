import Link from 'next/link';
import {categoryRegistry} from '@/data/games';
import {getGames,categoryNames} from '@/i18n/games';
import GameCard from '@/components/GameCard';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import PortalGameSections from '@/components/PortalGameSections';
import {site,absoluteUrl} from '@/config/site';
import {localizedMetadata} from '@/i18n/metadata';

export const metadata=localizedMetadata('zh-CN','/','GameVado - 免费在线浏览器小游戏','无需下载或注册，直接畅玩益智、街机、动作、三消和策略小游戏。');
export default function Page(){const games=getGames('zh-CN'),schema={"@context":"https://schema.org","@type":"WebSite",name:site.name,url:absoluteUrl('/zh'),description:'免费在线浏览器小游戏，无需下载或注册。',inLanguage:'zh-CN'};return <div className="container">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  <section style={{padding:'54px 0 26px'}}><span style={{color:'var(--brand)',fontWeight:800}}>无需下载，打开就玩</span><h1 style={{fontSize:'clamp(2rem,6vw,4rem)',maxWidth:700,margin:'10px 0'}}>适合休息时间的免费浏览器小游戏</h1><p className="muted" style={{fontSize:19,maxWidth:600}}>原创小游戏、快速开始、无需账号。挑一款游戏，让接下来的几分钟更有趣。</p><Link href="/zh/games" className="btn">浏览全部游戏</Link></section>
  <section><h2>热门游戏</h2><div className="grid-cards">{games.filter(g=>g.featured).slice(0,8).map(g=><GameCard locale="zh-CN" key={g.id} game={g}/>)}</div></section>
  <PortalGameSections games={games} locale="zh-CN"/><RecentlyPlayed locale="zh-CN" items={games}/>
  <section style={{marginTop:42}}><h2>浏览分类</h2><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{categoryRegistry.map(c=><Link className="btn secondary" href={`/zh/category/${c.slug}`} key={c.slug}>{categoryNames[c.name]}</Link>)}</div><p><Link href="/zh/categories">查看全部分类</Link></p></section>
  <section style={{marginTop:42}}><h2>最新小游戏</h2><div className="grid-cards">{games.filter(g=>g.isNew&&!g.tags.includes('match-3')).slice(0,6).map(g=><GameCard locale="zh-CN" key={g.id} game={g}/>)}</div><p style={{marginTop:24}}><Link className="btn secondary" href="/zh/games">查看完整游戏合集</Link></p></section>
  <section className="prose" style={{marginTop:48}}><h2>轻量小游戏，认真打磨</h2><p>{site.name} 为任务之间的短暂休息而设计。所有游戏都能直接在浏览器中打开，支持触屏操作，也不需要大型下载。这里包含益智、街机动作、三消、纸牌、记忆和快速策略玩法。</p></section>
</div>}
