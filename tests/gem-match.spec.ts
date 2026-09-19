import {test,expect,type Page} from './fixtures';
import {canSwap, type Board} from '../src/games/gem-match/engine';
async function installSpy(page:Page) { if(process.env.NEXT_PUBLIC_GA_ID)await page.waitForFunction(()=>typeof window.gtag==='function'); await page.evaluate(()=>{const w=window as unknown as {__events:unknown[];gtag:Window['gtag']};w.__events=[];w.gtag=(command,name,params)=>w.__events.push({command,name,params});}); }
async function captured(page:Page) {return page.evaluate(()=>(window as unknown as {__events:Array<{name:string;params:Record<string,unknown>}>}).__events);}
async function move(page:Page) {
 await page.getByRole('button',{name:'Hint',exact:true}).click();
 const indices=await page.locator('[data-hint="true"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-cell')));
 expect(indices).toHaveLength(2);
 for(const index of indices) await page.locator(`[data-cell="${index}"]`).click();
 await expect(page.getByRole('group',{name:'Gem board'})).toHaveAttribute('aria-busy','false');
}
test('Gem Match: tap controls, completion, stars, unlock, replay, restoration and single analytics',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/games/gem-match');await expect(page.getByRole('heading',{name:'Level Select',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Level 2, locked',exact:true})).toBeDisabled();
 await page.evaluate(()=>{(window as Window&{__events?:unknown[]}).__events=[];window.gtag=(command,name,params)=>{(window as unknown as Window&{__events:unknown[]}).__events.push({command,name,params})};});
 await page.getByRole('button',{name:'Level 1, unlocked',exact:true}).click();
 await expect(page.locator('[data-cell]')).toHaveCount(64);
 for(let i=0;i<25&&await page.getByRole('button',{name:'Hint',exact:true}).isEnabled();i++) await move(page);
 await expect(page.getByRole('heading',{name:'Level Complete',exact:true})).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('miniplay:gem-match:progress')!));expect(saved.unlocked).toBe(2);expect(saved.records[1].stars).toBeGreaterThan(0);
 if(process.env.NEXT_PUBLIC_GA_ID){const events=await page.evaluate(()=>(window as unknown as Window&{__events:Array<{name:string;params:unknown}>}).__events);for(const name of ['game_start','level_start','game_complete','level_complete'])expect(events.filter(e=>e.name===name)).toHaveLength(1);expect(events.find(e=>e.name==='game_complete')?.params).toMatchObject({game_slug:'gem-match',result:'win'});}
 await page.getByRole('button',{name:'Next Level',exact:true}).click();await expect(page.getByRole('group',{name:'Gem board'})).toBeVisible();
 await page.getByRole('button',{name:'Restart',exact:true}).click();await page.getByRole('button',{name:'Level Select',exact:true}).click();await expect(page.getByRole('button',{name:'Level 1, completed',exact:false})).toBeEnabled();
 await page.getByRole('button',{name:'Sound Off',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Sound On',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Level 2, unlocked',exact:true})).toBeEnabled();expect(errors).toEqual([]);
});
test('Gem Match: loss, retry and level selection; no repeated terminal events',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{const records=Object.fromEntries(Array.from({length:29},(_,i)=>[i+1,{score:5000,stars:3,completed:true}]));localStorage.setItem('miniplay:gem-match:progress',JSON.stringify({version:1,unlocked:30,records}));});
 await page.goto('/games/gem-match');await installSpy(page);await page.getByRole('button',{name:'Level 30, unlocked',exact:true}).click();
 for(let i=0;i<27&&await page.getByRole('button',{name:'Hint',exact:true}).isEnabled();i++)await move(page);
 await expect(page.getByRole('heading',{name:'Out of Moves',exact:true})).toBeVisible();
 if(process.env.NEXT_PUBLIC_GA_ID){const e=await captured(page);for(const name of ['game_start','level_start','game_complete','level_fail'])expect(e.filter(x=>x.name===name)).toHaveLength(1);expect(e.find(x=>x.name==='game_complete')?.params.result).toBe('loss');expect(e.find(x=>x.name==='level_fail')?.params.level).toBe(30);}
 await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.getByRole('button',{name:'Hint',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Level Select',exact:true}).click();await expect(page.getByRole('heading',{name:'Level Select',exact:true})).toBeVisible();
 if(process.env.NEXT_PUBLIC_GA_ID){const e=await captured(page);expect(e.filter(x=>x.name==='game_restart')).toHaveLength(1);expect(e.filter(x=>x.name==='level_fail')).toHaveLength(1);}
});
test('Gem Match: invalid tap swap restores, and leaving during animation cancels the turn',async({page})=>{
 await page.goto('/games/gem-match');await installSpy(page);await page.getByRole('button',{name:'Level 1, unlocked',exact:true}).click();
 const before=await page.locator('[data-cell]').evaluateAll(nodes=>nodes.map((n,i)=>({id:i,color:Number(n.getAttribute('data-color'))}))) as Board;
 let a=0;while(a<63&&(a%8===7||canSwap(before,a,a+1)))a++;expect(a).toBeLessThan(63);
 await page.locator(`[data-cell="${a}"]`).click();await page.locator(`[data-cell="${a+1}"]`).click();await expect(page.getByRole('group',{name:'Gem board'})).toHaveAttribute('aria-busy','false');
 const after=await page.locator('[data-cell]').evaluateAll(nodes=>nodes.map((n,i)=>({id:i,color:Number(n.getAttribute('data-color'))})));expect(after).toEqual(before);expect(await captured(page)).toEqual([]);
 await page.getByRole('button',{name:'Hint',exact:true}).click();const hints=await page.locator('[data-hint="true"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-cell')));for(const i of hints)await page.locator(`[data-cell="${i}"]`).click();
 await page.getByRole('button',{name:'Level Select',exact:true}).click();await expect(page.getByRole('heading',{name:'Level Select',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Level Complete',exact:true})).toHaveCount(0);
});
test('Gem Match: SEO, discovery and narrow-screen layout',async({page})=>{
 await page.goto('/games/gem-match');await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/games/gem-match`);await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',/Gem Match/);await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content',/Gem Match/);
 for(const name of ['Play Gem Match Online','How to Play','Special Gems','Levels and Goals','Match-3 Strategy Tips','FAQ'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
 const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').last().textContent()||'[]');expect(schema.map((s:{'@type':string})=>s['@type'])).toEqual(['VideoGame','BreadcrumbList']);
 await page.getByRole('button',{name:'Level 1, unlocked',exact:true}).click();
 for(const width of [375,320]){await page.setViewportSize({width,height:812});await expect(page.locator('.desktop-nav')).toBeHidden();const menu=await page.getByRole('button',{name:'Toggle menu'}).boundingBox();expect(menu!.x+menu!.width).toBeLessThanOrEqual(width);const box=await page.getByRole('group',{name:'Gem board'}).boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect((await page.locator('[data-cell="0"]').boundingBox())!.width).toBeGreaterThanOrEqual(30);}
 for(const route of ['/','/games','/category/puzzle']){await page.goto(route);await expect(page.locator('a[href="/games/gem-match"]').first()).toBeVisible();}
 const sitemap=await page.request.get('/sitemap.xml');expect(await sitemap.text()).toContain(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/games/gem-match`);
});
