import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { externalGames, approvedExternalGames } from '@/data/external-games';

export const dynamicParams = false;
export function generateStaticParams() {
  return approvedExternalGames.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const game=approvedExternalGames.find(g=>g.slug===slug);
  return game ? {title:`${game.title} | GameVado`,description:game.description,robots:{index:true,follow:true}} : {robots:{index:false,follow:false}};
}
export default async function ExternalGamePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const game=approvedExternalGames.find(g=>g.slug===slug);
  if(!game)notFound();
  const action=game.launchType==='download'?'Visit Official Download':'Visit Official Website';
  return <main className="container" style={{paddingTop:48,paddingBottom:80,maxWidth:850}}>
    <p className="muted">External game · {game.platforms.join(' / ')}</p>
    <h1>{game.title}</h1><p>{game.description}</p>
    <p>This game is hosted by its creator, not GameVado. The link opens an external website. Downloads, accounts, fees and API requirements are managed by that provider.</p>
    <p><a href={game.officialUrl} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',padding:'14px 20px',borderRadius:12,background:'#2563eb',color:'#fff',fontWeight:700}}>{action} ↗</a></p>
    {game.sourceUrl && <p><a href={game.sourceUrl} target="_blank" rel="noopener noreferrer">View source repository ↗</a></p>}
    <p className="muted">License information: {game.licenseNote}</p>
  </main>;
}
