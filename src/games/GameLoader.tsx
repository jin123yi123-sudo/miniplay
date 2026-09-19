"use client";
import dynamic from "next/dynamic";
import{useI18n}from'@/i18n/LocaleContext';const Loading=()=>{const{t}=useI18n();return <p>{t.common.loading}</p>};
const map={
  "gem-match":dynamic(()=>import("./gem-match/Game"),{ssr:false,loading:Loading}),
  "fruit-match":dynamic(()=>import("./fruit-match/Game"),{ssr:false,loading:Loading}),
  "pet-match":dynamic(()=>import("./pet-match/Game"),{ssr:false,loading:Loading}),
  "dessert-match":dynamic(()=>import("./dessert-match/Game"),{ssr:false,loading:Loading}),
  "ocean-match":dynamic(()=>import("./ocean-match/Game"),{ssr:false,loading:Loading}),
  "space-match":dynamic(()=>import("./space-match/Game"),{ssr:false,loading:Loading}),
  "anime-match":dynamic(()=>import("./anime-match/Game"),{ssr:false,loading:Loading}),
  "number-merge":dynamic(()=>import("./number-merge/Game"),{ssr:false,loading:Loading}),
  snake:dynamic(()=>import("./snake/Game"),{ssr:false,loading:Loading}),
  sudoku:dynamic(()=>import("./sudoku/Game"),{ssr:false,loading:Loading}),
  solitaire:dynamic(()=>import("./solitaire/Game"),{ssr:false,loading:Loading}),
  "emoji-memory":dynamic(()=>import("./emoji-memory/Game"),{ssr:false,loading:Loading}),
  minesweeper:dynamic(()=>import("./minesweeper/Game"),{ssr:false,loading:Loading}),
  "tic-tac-toe":dynamic(()=>import("./tic-tac-toe/Game"),{ssr:false,loading:Loading}),
  pong:dynamic(()=>import("./pong/Game"),{ssr:false,loading:Loading}),
  breakout:dynamic(()=>import("./breakout/Game"),{ssr:false,loading:Loading}),
  "connect-four":dynamic(()=>import("./connect-four/Game"),{ssr:false,loading:Loading}),
  "2048-merge":dynamic(()=>import("./2048-merge/Game"),{ssr:false,loading:Loading}),
  "tank-duel":dynamic(()=>import("./tank-duel/Game"),{ssr:false,loading:Loading}),
  "pixel-fighters":dynamic(()=>import("./pixel-fighters/Game"),{ssr:false,loading:Loading}),
  "galaxy-strike":dynamic(()=>import("./galaxy-strike/Game"),{ssr:false,loading:Loading}),
  "neon-runner":dynamic(()=>import("./neon-runner/Game"),{ssr:false,loading:Loading}),
  "fruit-slash":dynamic(()=>import("./fruit-slash/Game"),{ssr:false,loading:Loading}),
};
export type GameSlug=keyof typeof map;
export default function GameLoader({slug}:{slug:GameSlug}){const C=map[slug];return <C/>}
