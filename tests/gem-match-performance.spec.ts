import {test,expect} from './fixtures';
test('Gem Match: engine remains route-lazy and initial display is stable',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>{const w=window as unknown as {__cls:number};w.__cls=0;new PerformanceObserver(list=>{for(const entry of list.getEntries()){const e=entry as PerformanceEntry&{hadRecentInput:boolean;value:number};if(!e.hadRecentInput)w.__cls+=e.value;}}).observe({type:'layout-shift',buffered:true});});
 for(const path of ['/','/games/sudoku','/games/gem-match']){
  await page.goto(path);await expect(page.locator('h1')).toBeVisible();if(path.includes('/games/'))await expect(page.locator('.game-stage')).toBeVisible();
  const scripts=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('/_next/')&&n.split('?')[0].endsWith('.js')));
  let bytes=0,engine=false;for(const url of scripts){const response=await page.request.get(url);const body=await response.body();bytes+=body.length;if(body.toString().includes('Leaving a level does not save an unfinished board'))engine=true;}
  expect(engine,path).toBe(path==='/games/gem-match');
  const cls=await page.evaluate(()=>(window as unknown as {__cls:number}).__cls);
  console.log(`${path}: requested JS ${bytes} bytes; CLS ${cls.toFixed(4)}`);
  if(path==='/games/gem-match')expect(cls).toBeLessThan(.1);
 }
 expect(errors).toEqual([]);
});
test('Match-3 themes load only the selected theme config',async({page})=>{
 const routes=[
  {path:'/games/fruit-match',own:'FRUIT BURST!',foreign:['PLAYTIME POP!','SUPERNOVA!']},
  {path:'/games/pet-match',own:'PLAYTIME POP!',foreign:['FRUIT BURST!','SUPERNOVA!']},
  {path:'/games/space-match',own:'SUPERNOVA!',foreign:['FRUIT BURST!','PLAYTIME POP!']},
 ];
 for(const route of routes){
  await page.goto(route.path);await expect(page.getByRole('heading',{name:'Level Select',exact:true})).toBeVisible();
  const scripts=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('/_next/')&&n.split('?')[0].endsWith('.js')));
  const source=(await Promise.all(scripts.map(async url=>(await page.request.get(url)).text()))).join('\n');
  expect(source).toContain(route.own);for(const marker of route.foreign)expect(source).not.toContain(marker);
 }
});
