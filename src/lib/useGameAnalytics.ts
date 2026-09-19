"use client";
import {useCallback,useEffect,useMemo,useRef} from "react";
import {gameBySlug} from "@/data/games";
import {trackGameEvent,type GameResult} from "./analytics";
import{useLocale}from'@/i18n/LocaleContext';

// One start and completion per explicit round; restored/completed pages emit neither.
export function useGameAnalytics(slug:string,result:GameResult|null=null) {
  const locale=useLocale();
  const localized=useMemo(()=>locale==='zh-CN'?{locale}as const:{},[locale]);
  const started=useRef(false),completed=useRef(false),finished=useRef(Boolean(result));
  const game=gameBySlug(slug)!;
  const start=useCallback(()=>{
    if(started.current||finished.current)return;
    started.current=true;
    trackGameEvent("game_start",{game_name:game.title,game_slug:slug,...localized});
  },[game.title,slug,localized]);
  const restart=useCallback(()=>{
    started.current=false;completed.current=false;finished.current=false;
    trackGameEvent("game_restart",{game_name:game.title,game_slug:slug,...localized});
  },[game.title,slug,localized]);
  // Difficulty changes reset the analytics round without inventing a restart click.
  const reset=useCallback(()=>{started.current=false;completed.current=false;finished.current=false;},[]);
  useEffect(()=>{
    finished.current=Boolean(result);
    if(!result||!started.current||completed.current)return;
    completed.current=true;
    if(result==='loss')trackGameEvent("game_over",{game_name:game.title,game_slug:slug,result,...localized});
    trackGameEvent("game_complete",{game_name:game.title,game_slug:slug,result,...localized});
  },[result,game.title,slug,localized]);
  return {start,restart,reset};
}
