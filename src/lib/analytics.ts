export type GameEvent = "game_start" | "game_restart" | "game_complete";
export type GameResult = "win" | "complete" | "loss" | "draw";
export type GameEventParams = {game_name:string;game_slug:string;result?:GameResult};

declare global {
  interface Window {
    gtag?: (command:"event", event:GameEvent, params:GameEventParams)=>void;
  }
}

export function trackGameEvent(event:GameEvent, params:GameEventParams) {
  if (!process.env.NEXT_PUBLIC_GA_ID?.trim() || typeof window === "undefined" || typeof window.gtag !== "function") return;
  try { window.gtag("event", event, params); } catch { /* Analytics must never interrupt a game. */ }
}
