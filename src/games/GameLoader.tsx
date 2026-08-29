"use client";
import dynamic from "next/dynamic";
const Loading=()=> <p>Loading game…</p>;
const map={
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
};
export type GameSlug=keyof typeof map;
export default function GameLoader({slug}:{slug:GameSlug}){const C=map[slug];return <C/>}
