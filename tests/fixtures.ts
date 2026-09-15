import {test as base} from "@playwright/test";
export {expect} from "@playwright/test";
export type {Page} from "@playwright/test";

export const test=base.extend<{blockGoogleAnalytics:void}>({
  blockGoogleAnalytics:[async({context},use)=>{
    await context.route(/https:\/\/.*(?:googletagmanager\.com|google-analytics\.com)\//,route=>route.fulfill({status:200,contentType:"application/javascript",body:""}));
    await use();
  },{auto:true}],
});
