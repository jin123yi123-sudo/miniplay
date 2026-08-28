"use client";
import{useEffect,useState}from"react";
import GameShell from"@/components/GameShell";
import{gameBySlug}from"@/data/games";
import{getStored,setStored}from"@/lib/storage";

const solution="534678912672195348198342567859761423426853791713924856961537284287419635345286179".split("").map(Number);
const holes:Record<string,number>={Easy:35,Medium:45,Hard:52};
type Save={level:string;grid:number[];fixed:boolean[];time:number;mistakes:number};

function countSolutions(input:number[],limit=2){
  const grid=[...input];let count=0;
  function solve(){if(count>=limit)return;let best=-1,bestOptions:number[]=[];for(let index=0;index<81;index++){if(grid[index])continue;const row=Math.floor(index/9),col=index%9,boxRow=Math.floor(row/3)*3,boxCol=Math.floor(col/3)*3,used=new Set<number>();for(let i=0;i<9;i++){used.add(grid[row*9+i]);used.add(grid[i*9+col]);used.add(grid[(boxRow+Math.floor(i/3))*9+boxCol+i%3])}const options=[1,2,3,4,5,6,7,8,9].filter(value=>!used.has(value));if(!options.length)return;if(best<0||options.length<bestOptions.length){best=index;bestOptions=options;if(options.length===1)break}}if(best<0){count++;return}for(const value of bestOptions){grid[best]=value;solve();grid[best]=0;if(count>=limit)return}}
  solve();return count;
}

function make(level:string):Save{
  const safeLevel=holes[level]?level:"Easy",grid=[...solution];
  const order=Array.from({length:81},(_,index)=>index).sort(()=>Math.random()-.5);let removed=0;
  for(const index of order){if(removed>=holes[safeLevel])break;const previous=grid[index];grid[index]=0;if(countSolutions(grid)!==1)grid[index]=previous;else removed++}
  return{level:safeLevel,grid,fixed:grid.map(Boolean),time:0,mistakes:0};
}

function validSave(value:Save){return value&&holes[value.level]&&Array.isArray(value.grid)&&value.grid.length===81&&Array.isArray(value.fixed)&&value.fixed.length===81&&value.grid.every(n=>Number.isInteger(n)&&n>=0&&n<=9)&&Number.isFinite(value.time)&&Number.isFinite(value.mistakes)}

export default function Sudoku(){
  const[s,setS]=useState<Save>(()=>{const saved=getStored<Save|null>("sudoku:current",null);return saved&&validSave(saved)?saved:make("Easy")}),[selected,setSelected]=useState(0);
  useEffect(()=>{setStored("sudoku:current",s)},[s]);
  useEffect(()=>{const id=window.setInterval(()=>setS(current=>({...current,time:current.time+1})),1000);return()=>window.clearInterval(id)},[]);
  const reset=(level=s.level)=>{setS(make(level));setSelected(0)};
  const input=(value:number)=>{if(s.fixed[selected])return;setS(current=>{const grid=[...current.grid];grid[selected]=value;return{...current,grid,mistakes:current.mistakes+(value!==0&&value!==solution[selected]?1:0)}})};
  const won=s.grid.every((value,index)=>value===solution[index]);
  return <GameShell game={gameBySlug("sudoku")!} restart={()=>reset()}><div style={{width:"min(94vw,520px)",textAlign:"center"}}><div className="game-controls"><label>Difficulty <select aria-label="Sudoku difficulty" value={s.level} onChange={event=>reset(event.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></label><span className="stat">Time {Math.floor(s.time/60)}:{String(s.time%60).padStart(2,"0")}</span><span className="stat">Mistakes {s.mistakes}</span><button className="btn secondary" onClick={()=>reset()}>New Game</button></div><div role="grid" aria-label="Sudoku board" data-testid="sudoku-board" style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",border:"2px solid #172033"}}>{s.grid.map((value,index)=><button role="gridcell" aria-label={`Row ${Math.floor(index/9)+1}, column ${index%9+1}${value?`, value ${value}`:", empty"}`} aria-selected={selected===index} disabled={s.fixed[index]} onClick={()=>setSelected(index)} key={index} style={{aspectRatio:"1",border:"1px solid #d0d5dd",borderRight:(index+1)%3===0?"2px solid #172033":undefined,borderBottom:Math.floor(index/9)%3===2?"2px solid #172033":undefined,background:selected===index?"#ddd7ff":s.fixed[index]?"#f2f4f7":"white",fontWeight:s.fixed[index]?800:500,color:value&&value!==solution[index]?"#b42318":"#172033",fontSize:"clamp(13px,4vw,20px)"}}>{value||""}</button>)}</div><div className="game-controls" aria-label="Sudoku number pad">{[1,2,3,4,5,6,7,8,9].map(value=><button className="btn" onClick={()=>input(value)} key={value}>{value}</button>)}<button className="btn secondary" onClick={()=>input(0)}>Clear</button></div>{won&&<h2 role="status">🎉 Puzzle complete!</h2>}</div></GameShell>;
}
