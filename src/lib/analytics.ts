export type GameEvent = "game_start" | "game_restart" | "game_over" | "game_complete" | "level_start" | "level_complete" | "level_fail" | "multiplayer_match_start" | "multiplayer_round_end" | "multiplayer_match_end";
export type GameResult = "win" | "complete" | "loss" | "draw";
export type GameEventParams = {game_name:string;game_slug:string;locale?:"en"|"zh-CN";result?:GameResult;level?:number;score?:number;stars?:number;moves?:number;moves_remaining?:number;duration?:number;winner?:string};

declare global {
  interface Window {
    gtag?: (command:"event", event:GameEvent, params:GameEventParams)=>void;
  }
}

export function trackGameEvent(event:GameEvent, params:GameEventParams) {
  if (!process.env.NEXT_PUBLIC_GA_ID?.trim() || typeof window === "undefined" || typeof window.gtag !== "function") return;
  try { window.gtag("event", event, params); } catch { /* Analytics must never interrupt a game. */ }
}
