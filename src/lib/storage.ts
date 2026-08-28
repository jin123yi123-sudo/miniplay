"use client";
const prefix="miniplay:";
export function getStored<T>(key:string,fallback:T):T{if(typeof window==="undefined")return fallback;try{const v=localStorage.getItem(prefix+key);return v?JSON.parse(v):fallback}catch{return fallback}}
export function setStored<T>(key:string,value:T){if(typeof window==="undefined")return false;try{localStorage.setItem(prefix+key,JSON.stringify(value));return true}catch{return false}}
export function bestScore(game:string,score:number){const old=getStored<number>(`best:${game}`,0);if(score>old)setStored(`best:${game}`,score);return Math.max(old,score)}
