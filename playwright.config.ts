import{defineConfig,devices}from"@playwright/test";
process.env.NEXT_PUBLIC_SITE_URL??="https://gamevado.com";
process.env.NEXT_PUBLIC_GA_ID??="G-TEST000000";
export default defineConfig({testDir:"./tests",fullyParallel:false,workers:2,retries:1,reporter:"list",use:{baseURL:"http://localhost:3000",trace:"retain-on-failure",channel:"chrome"},projects:[{name:"desktop",use:{...devices["Desktop Chrome"],viewport:{width:1366,height:768}}},{name:"mobile",use:{...devices["Desktop Chrome"],viewport:{width:375,height:812},isMobile:true,hasTouch:true}}],webServer:{command:"pnpm dev",url:"http://localhost:3000",reuseExistingServer:true,timeout:120000,env:{NEXT_PUBLIC_SITE_URL:"https://gamevado.com",NEXT_PUBLIC_GA_ID:"G-TEST000000"}}});
