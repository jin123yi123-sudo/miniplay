"use client";
import { useState } from "react";
import GameShell from "@/components/GameShell";
import { gameBySlug } from "@/data/games";
type Cell = "X" | "O" | "";
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winner = (board: Cell[]) => lines.find((line) => board[line[0]] && board[line[0]] === board[line[1]] && board[line[1]] === board[line[2]])?.map((index) => board[index])[0] || "";
function minimax(board: Cell[], cpu: boolean): number { const result=winner(board); if(result==="O")return 10;if(result==="X")return-10;if(board.every(Boolean))return 0;const scores=board.map((cell,index)=>{if(cell)return cpu?-Infinity:Infinity;const next=[...board];next[index]=cpu?"O":"X";return minimax(next,!cpu)});return cpu?Math.max(...scores):Math.min(...scores) }
function cpuMove(board: Cell[]) { let best=-Infinity,move=-1;board.forEach((cell,index)=>{if(cell)return;const next=[...board];next[index]="O";const score=minimax(next,false);if(score>best){best=score;move=index}});return move }
export default function TicTacToe(){
  const [board,setBoard]=useState<Cell[]>(()=>Array(9).fill("")),[thinking,setThinking]=useState(false);
  const result=winner(board),draw=!result&&board.every(Boolean);
  const reset=()=>{setBoard(Array(9).fill(""));setThinking(false)};
  function play(index:number){if(board[index]||result||draw||thinking)return;const next=[...board];next[index]="X";setBoard(next);if(winner(next)||next.every(Boolean))return;setThinking(true);window.setTimeout(()=>{const choice=cpuMove(next),cpuBoard=[...next];if(choice>=0)cpuBoard[choice]="O";setBoard(cpuBoard);setThinking(false)},180)}
  return <GameShell game={gameBySlug("tic-tac-toe")!} restart={reset}><div style={{width:"min(90vw,420px)",textAlign:"center"}}><p className="stat" role="status">{result?result==="X"?"You win!":"CPU wins":draw?"Draw":thinking?"CPU is thinking…":"Your turn — you are X"}</p><div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">{board.map((cell,index)=><button role="gridcell" aria-label={`Square ${index+1}${cell?`, ${cell}`:", empty"}`} disabled={Boolean(cell)||Boolean(result)||draw||thinking} onClick={()=>play(index)} key={index}>{cell}</button>)}</div></div></GameShell>
}
