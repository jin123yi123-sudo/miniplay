import{expect,test}from"@playwright/test";
const gameSlugs=["number-merge","snake","sudoku","solitaire","emoji-memory","minesweeper","tic-tac-toe","pong","breakout","connect-four"];
const categories=["puzzle","arcade","brain","card","casual"];
test("public routes load without horizontal page overflow",async({page})=>{for(const path of["/","/games",...categories.map(value=>`/category/${value}`),"/privacy","/terms","/about","/contact"]){await page.goto(path);await expect(page.locator("h1")).toBeVisible();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);expect(overflow,`${path} has horizontal overflow`).toBeFalsy()}});
test("all game pages load",async({page})=>{for(const slug of gameSlugs){await page.goto(`/games/${slug}`);await expect(page.locator("h1")).toBeVisible();await expect(page.locator(".game-stage")).toBeVisible()}});
test("unknown game returns a real 404",async({page})=>{const response=await page.goto("/games/does-not-exist");expect(response?.status()).toBe(404);await expect(page.getByRole("heading",{name:"Game not found"})).toBeVisible()});
