import {expect,test} from "@playwright/test";
import {trackGameEvent} from "../src/lib/analytics";

test("analytics helper is safe for SSR, missing configuration, missing or broken gtag",()=>{
  const previousId=process.env.NEXT_PUBLIC_GA_ID;
  const previousWindow=Object.getOwnPropertyDescriptor(globalThis,"window");
  const params={game_name:"Snake",game_slug:"snake"};
  try {
    process.env.NEXT_PUBLIC_GA_ID="G-5QSPKVSHTN";
    Reflect.deleteProperty(globalThis,"window");
    expect(()=>trackGameEvent("game_start",params)).not.toThrow();
    Object.defineProperty(globalThis,"window",{configurable:true,value:{}});
    expect(()=>trackGameEvent("game_start",params)).not.toThrow();
    const calls:unknown[][]=[];
    Object.defineProperty(globalThis,"window",{configurable:true,value:{gtag:(...args:unknown[])=>calls.push(args)}});
    process.env.NEXT_PUBLIC_GA_ID="";
    trackGameEvent("game_start",params);
    expect(calls).toHaveLength(0);
    process.env.NEXT_PUBLIC_GA_ID="G-5QSPKVSHTN";
    trackGameEvent("game_start",params);
    expect(calls).toEqual([["event","game_start",params]]);
    Object.defineProperty(globalThis,"window",{configurable:true,value:{gtag:()=>{throw new Error("Blocked")}}});
    expect(()=>trackGameEvent("game_start",params)).not.toThrow();
  } finally {
    if(previousId===undefined)delete process.env.NEXT_PUBLIC_GA_ID;else process.env.NEXT_PUBLIC_GA_ID=previousId;
    if(previousWindow)Object.defineProperty(globalThis,"window",previousWindow);else Reflect.deleteProperty(globalThis,"window");
  }
});
