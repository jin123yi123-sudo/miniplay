import {expect,test} from './fixtures';

const games=['2048-merge','tank-duel','pixel-fighters','galaxy-strike','neon-runner','fruit-slash'];

test('phase two games have crawlable English and Chinese pages',async({page})=>{
  for(const slug of games)for(const prefix of['','/zh']){
    const response=await page.goto(`${prefix}/games/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.game-stage')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new RegExp(`${prefix}/games/${slug}$`));
  }
});

test('home portal exposes multiplayer and arcade collections',async({page})=>{
  for(const path of['/','/zh']){await page.goto(path);await expect(page.getByRole('heading',{name:path==='/zh'?'同屏双人游戏':'Play Together on One Keyboard'})).toBeVisible();await expect(page.getByRole('heading',{name:path==='/zh'?'街机精选':'Arcade Hits'})).toBeVisible()}
});

test('multiplayer controls accept simultaneous player keys and pause',async({page})=>{
  await page.goto('/games/tank-duel');
  await page.keyboard.down('w');await page.keyboard.down('ArrowLeft');await page.waitForTimeout(100);await page.keyboard.up('w');await page.keyboard.up('ArrowLeft');
  await page.keyboard.press('p');await expect(page.getByText('Paused')).toBeVisible();await page.keyboard.press('p');
});

test('new games fit a 320px viewport without page overflow',async({page})=>{
  await page.setViewportSize({width:320,height:812});
  for(const slug of games){await page.goto(`/games/${slug}`);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),slug).toBeTruthy()}
});
