"use client";
import {useCallback,useEffect,useRef} from "react";
import {gameBySlug} from "@/data/games";
import {trackGameEvent,type GameResult} from "./analytics";

// One start and completion per explicit round; restored/completed pages emit neither.
export function useGameAnalytics(slug:string,result:GameResult|null=null) {
  const started=useRef(false),completed=useRef(false),finished=useRef(Boolean(result));
  const game=gameBySlug(slug)!;
  const start=useCallback(()=>{
    if(started.current||finished.current)return;
    started.current=true;
    trackGameEvent("game_start",{game_name:game.title,game_slug:slug});
  },[game.title,slug]);
  const restart=useCallback(()=>{
    started.current=false;completed.current=false;finished.current=false;
    trackGameEvent("game_restart",{game_name:game.title,game_slug:slug});
  },[game.title,slug]);
  // Difficulty changes reset the analytics round without inventing a restart click.
  const reset=useCallback(()=>{started.current=false;completed.current=false;finished.current=false;},[]);
  useEffect(()=>{
    finished.current=Boolean(result);
    if(!result||!started.current||completed.current)return;
    completed.current=true;
    trackGameEvent("game_complete",{game_name:game.title,game_slug:slug,result});
  },[result,game.title,slug]);
  return {start,restart,reset};
}
