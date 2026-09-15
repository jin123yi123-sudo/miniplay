import {expect,test,type Page} from "./fixtures";

const gaId=process.env.NEXT_PUBLIC_GA_ID?.trim();
async function events(page:Page) {
  return page.evaluate(()=>((window as Window & {dataLayer?:ArrayLike<unknown>[]}).dataLayer||[])
    .map(item=>Array.from(item)).filter(item=>item[0]==="event")
    .map(item=>({name:item[1],params:item[2]})));
}
test.beforeEach(async({page})=>{
  // Never transmit automated game events to the real GA4 property.
  await page.route(/https:\/\/.*(?:googletagmanager\.com|google-analytics\.com)\//,route=>route.fulfill({status:200,contentType:"application/javascript",body:""}));
});
test("GA loader is conditional, single, and stable across App Router navigation",async({page})=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading",{level:1})).toBeVisible();
  if(gaId){
    await expect(page.locator("#gamevado-ga-loader")).toHaveAttribute("src",`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
    await expect(page.locator("#gamevado-ga-init")).toHaveCount(1);
    await page.getByRole("link",{name:"Browse all games",exact:true}).click();
    await expect(page).toHaveURL(/\/games$/);
    await expect(page.locator("#gamevado-ga-loader")).toHaveCount(1);
    const commands=await page.evaluate(()=>((window as Window & {dataLayer?:ArrayLike<unknown>[]}).dataLayer||[]).map(item=>Array.from(item)));
    expect(commands.filter(item=>item[0]==="config")).toHaveLength(1);
    expect(commands.find(item=>item[0]==="config")?.[1]).toBe(gaId);
    expect(commands.filter(item=>item[0]==="event"&&item[1]==="page_view")).toHaveLength(0);
  }else{
    await expect(page.locator('script[src*="googletagmanager.com"],#gamevado-ga-init')).toHaveCount(0);
    expect(await page.evaluate(()=>typeof window.gtag)).toBe("undefined");
  }
  expect(errors).toEqual([]);
});

const actions:Array<{slug:string;name:string;act:(page:Page)=>Promise<unknown>}>= [
  {slug:"number-merge",name:"Number Merge",act:page=>page.keyboard.press("ArrowLeft")},
  {slug:"snake",name:"Snake",act:page=>page.getByRole("button",{name:"Move down",exact:true}).click()},
  {slug:"sudoku",name:"Sudoku",act:async page=>{await page.getByRole("gridcell",{name:/empty/}).first().click();await page.getByRole("button",{name:"1",exact:true}).click()}},
  {slug:"solitaire",name:"Solitaire",act:page=>page.getByTestId("solitaire-stock").click()},
  {slug:"emoji-memory",name:"Emoji Memory",act:page=>page.getByRole("button",{name:"Hidden card"}).first().click()},
  {slug:"minesweeper",name:"Minesweeper",act:page=>page.getByTestId("mine-board").getByRole("button").first().click()},
  {slug:"tic-tac-toe",name:"Tic Tac Toe",act:page=>page.getByRole("gridcell",{name:/empty/}).first().click()},
  {slug:"pong",name:"Pong",act:page=>page.keyboard.press("ArrowDown")},
  {slug:"breakout",name:"Breakout",act:page=>page.keyboard.press("ArrowRight")},
  {slug:"connect-four",name:"Connect Four",act:page=>page.getByRole("button",{name:/column 1$/}).click()},
];
for(const game of actions){
  test(`${game.name}: meaningful start and explicit restart emit once`,async({page})=>{
    test.skip(!gaId,"Run again with NEXT_PUBLIC_GA_ID to test configured events.");
    await page.goto(`/games/${game.slug}`);
    await expect(page.locator(".game-stage")).toBeVisible();
    await expect(page.locator("#gamevado-ga-init")).toHaveCount(1);
    expect(await events(page)).toEqual([]);
    await game.act(page);
    await expect.poll(async()=> (await events(page)).filter(item=>item.name==="game_start").length).toBe(1);
    expect((await events(page)).find(item=>item.name==="game_start")?.params).toEqual({game_name:game.name,game_slug:game.slug});
    await page.getByRole("button",{name:/↻ Restart/}).click();
    expect((await events(page)).filter(item=>item.name==="game_restart")).toEqual([{name:"game_restart",params:{game_name:game.name,game_slug:game.slug}}]);
    await game.act(page);
    expect((await events(page)).filter(item=>item.name==="game_start")).toHaveLength(2);
  });
}
test("games remain usable when configured GA has no gtag",async({page})=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/games/tic-tac-toe");
  await expect(page.locator(".game-stage")).toBeVisible();
  if(gaId)await expect(page.locator("#gamevado-ga-init")).toHaveCount(1);
  await page.evaluate(()=>{delete window.gtag});
  await page.getByRole("gridcell",{name:/empty/}).first().click();
  await expect(page.getByRole("gridcell",{name:/, X/})).toHaveCount(1);
  await page.getByRole("button",{name:/↻ Restart/}).click();
  expect(errors).toEqual([]);
});
test("Sudoku completion is emitted once, never on restoring a finished puzzle",async({page})=>{
  test.skip(!gaId,"Requires configured GA.");
  const solution="534678912672195348198342567859761423426853791713924856961537284287419635345286179".split("").map(Number);
  await page.addInitScript(({solution})=>{
    const grid=[...solution];grid[0]=0;
    localStorage.setItem("miniplay:sudoku:current",JSON.stringify({level:"Easy",grid,fixed:grid.map(Boolean),time:0,mistakes:0}));
  },{solution});
  await page.goto("/games/sudoku");
  await expect(page.locator("#gamevado-ga-init")).toHaveCount(1);
  await page.getByRole("button",{name:"5",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:/Puzzle complete/})).toBeVisible();
  await expect.poll(async()=> (await events(page)).filter(item=>item.name==="game_complete").length).toBe(1);
  // Timer and selection updates must not duplicate the terminal event.
  await expect(page.getByText("Time 0:02",{exact:true})).toBeVisible();
  expect((await events(page)).filter(item=>item.name==="game_complete")).toEqual([{name:"game_complete",params:{game_name:"Sudoku",game_slug:"sudoku",result:"complete"}}]);
  await page.getByRole("button",{name:"New Game",exact:true}).click();
  expect((await events(page)).filter(item=>item.name==="game_restart")).toHaveLength(1);
});
test("restoring a completed Sudoku sends no start or completion",async({page})=>{
  test.skip(!gaId,"Requires configured GA.");
  await page.addInitScript(()=>{const grid="534678912672195348198342567859761423426853791713924856961537284287419635345286179".split("").map(Number);localStorage.setItem("miniplay:sudoku:current",JSON.stringify({level:"Easy",grid,fixed:grid.map(Boolean),time:0,mistakes:0}))});
  await page.goto("/games/sudoku");
  await expect(page.getByRole("status").filter({hasText:/Puzzle complete/})).toBeVisible();
  await expect(page.locator("#gamevado-ga-init")).toHaveCount(1);
  expect(await events(page)).toEqual([]);
});

test("Snake loss completes once only for an interacted round",async({page})=>{
  test.skip(!gaId,"Requires configured GA.");
  await page.clock.install();
  await page.goto("/games/snake");
  await expect(page.getByRole("button",{name:"Move right",exact:true})).toBeVisible();
  await expect(page.locator("#gamevado-ga-init")).toHaveCount(1);
  await page.clock.runFor(2500);
  await expect(page.getByRole("status").filter({hasText:"Game Over"})).toBeVisible();
  await page.getByRole("button",{name:"Move down",exact:true}).click();
  expect(await events(page)).toEqual([]);
  await page.getByRole("button",{name:/↻ Restart/}).click();
  await page.getByRole("button",{name:"Move right",exact:true}).click();
  await page.clock.runFor(2500);
  await expect(page.getByRole("status").filter({hasText:"Game Over"})).toBeVisible();
  await expect.poll(async()=> (await events(page)).filter(item=>item.name==="game_complete").length).toBe(1);
  await page.getByRole("button",{name:"Move down",exact:true}).click();
  expect((await events(page)).filter(item=>item.name==="game_start")).toHaveLength(1);
  expect((await events(page)).filter(item=>item.name==="game_complete")).toEqual([{name:"game_complete",params:{game_name:"Snake",game_slug:"snake",result:"loss"}}]);
});
