"use client";
import{useEffect,useMemo,useState}from"react";
import GameShell from"@/components/GameShell";
import{gameBySlug}from"@/data/games";

type Card={id:string;suit:string;rank:number;up:boolean};
type State={cols:Card[][];stock:Card[];waste:Card[];foundations:Record<string,Card[]>};
type Selection={kind:"tableau";col:number;index:number}|{kind:"waste"};
const suits=["♠","♥","♦","♣"];
const isRed=(suit:string)=>suit==="♥"||suit==="♦";
const rankLabel=(rank:number)=>["","A","2","3","4","5","6","7","8","9","10","J","Q","K"][rank];
const clone=(state:State):State=>({cols:state.cols.map(col=>col.map(card=>({...card}))),stock:state.stock.map(card=>({...card})),waste:state.waste.map(card=>({...card})),foundations:Object.fromEntries(suits.map(suit=>[suit,(state.foundations[suit]||[]).map(card=>({...card}))]))});

function newGame():State{
  const deck=suits.flatMap(suit=>Array.from({length:13},(_,index):Card=>({id:`${suit}-${index+1}`,suit,rank:index+1,up:false})));
  for(let index=deck.length-1;index>0;index--){const swap=Math.floor(Math.random()*(index+1));[deck[index],deck[swap]]=[deck[swap],deck[index]]}
  const cols:Card[][]=[];
  for(let count=1;count<=7;count++){const col=deck.splice(0,count);col[col.length-1].up=true;cols.push(col)}
  return{cols,stock:deck,waste:[],foundations:Object.fromEntries(suits.map(suit=>[suit,[]]))};
}

function validSequence(cards:Card[]){return cards.every((card,index)=>index===0||(cards[index-1].rank===card.rank+1&&isRed(cards[index-1].suit)!==isRed(card.suit)))&&cards.every(card=>card.up)}
function acceptsTableau(card:Card,target?:Card){return target?target.up&&target.rank===card.rank+1&&isRed(target.suit)!==isRed(card.suit):card.rank===13}

export default function Solitaire(){
  const[state,setState]=useState<State>(newGame),[history,setHistory]=useState<State[]>([]),[selection,setSelection]=useState<Selection|null>(null),[time,setTime]=useState(0);
  useEffect(()=>{const timer=window.setInterval(()=>setTime(value=>value+1),1000);return()=>window.clearInterval(timer)},[]);
  const won=useMemo(()=>suits.every(suit=>(state.foundations[suit]?.length||0)===13),[state.foundations]);
  const commit=(next:State)=>{setHistory(items=>[...items.slice(-29),clone(state)]);setState(next);setSelection(null)};
  const restart=()=>{setState(newGame());setHistory([]);setSelection(null);setTime(0)};
  const undo=()=>setHistory(items=>{const previous=items.at(-1);if(!previous)return items;setState(clone(previous));setSelection(null);return items.slice(0,-1)});
  const revealTop=(cols:Card[][],col:number)=>{const top=cols[col].at(-1);if(top&&!top.up)top.up=true};

  function deal(){
    const next=clone(state);
    if(next.stock.length){const card=next.stock.pop()!;card.up=true;next.waste.push(card);commit(next);return}
    if(!next.waste.length)return;
    next.stock=next.waste.reverse().map(card=>({...card,up:false}));next.waste=[];commit(next);
  }

  function moveTableau(from:number,index:number,to:number){
    if(from===to)return false;
    const moving=state.cols[from].slice(index),target=state.cols[to].at(-1);
    if(!moving.length||!validSequence(moving)||!acceptsTableau(moving[0],target))return false;
    const next=clone(state);next.cols[to].push(...next.cols[from].splice(index));revealTop(next.cols,from);commit(next);return true;
  }

  function moveWaste(to:number){
    const card=state.waste.at(-1),target=state.cols[to].at(-1);if(!card||!acceptsTableau(card,target))return false;
    const next=clone(state);next.cols[to].push(next.waste.pop()!);commit(next);return true;
  }

  function moveToFoundation(suit:string){
    const source=selection?.kind==="waste"?state.waste.at(-1):selection?.kind==="tableau"&&selection.index===state.cols[selection.col].length-1?state.cols[selection.col].at(-1):undefined;
    if(!source||source.suit!==suit)return false;
    const pile=state.foundations[suit]||[],top=pile.at(-1);if(source.rank!==(top?top.rank+1:1))return false;
    const next=clone(state);if(selection?.kind==="waste")next.foundations[suit].push(next.waste.pop()!);else if(selection?.kind==="tableau"){next.foundations[suit].push(next.cols[selection.col].pop()!);revealTop(next.cols,selection.col)}commit(next);return true;
  }

  function selectTableau(col:number,index:number){
    const cards=state.cols[col].slice(index);if(!validSequence(cards))return;
    if(selection){if(selection.kind==="tableau"&&selection.col===col&&selection.index===index){setSelection(null);return}const moved=selection.kind==="waste"?moveWaste(col):moveTableau(selection.col,selection.index,col);if(!moved)setSelection({kind:"tableau",col,index});return}
    setSelection({kind:"tableau",col,index});
  }
  function tapColumn(col:number){if(!selection)return;if(selection.kind==="waste")moveWaste(col);else moveTableau(selection.col,selection.index,col)}
  function selectWaste(){if(!state.waste.length)return;setSelection(current=>current?.kind==="waste"?null:{kind:"waste"})}

  const cardView=(card:Card,selected=false)=><div className={`playing-card ${card.up?"face-up":"face-down"} ${selected?"selected":""}`} style={{color:isRed(card.suit)?"#c72d2d":"#172033"}}>{card.up&&<><span>{rankLabel(card.rank)}</span><span aria-hidden="true">{card.suit}</span></>}</div>;
  return <GameShell game={gameBySlug("solitaire")!} restart={restart}><div className="solitaire" data-testid="solitaire-board"><div className="game-controls"><span className="stat">Time {Math.floor(time/60)}:{String(time%60).padStart(2,"0")}</span><button className="btn secondary" onClick={restart}>New Game</button><button className="btn secondary" onClick={undo} disabled={!history.length}>Undo</button></div><div className="solitaire-top"><div className="card-row"><button className="card-button" onClick={deal} aria-label={state.stock.length?`Deal from stock, ${state.stock.length} cards remaining`:state.waste.length?"Recycle waste into stock":"Empty stock"} data-testid="solitaire-stock">{state.stock.length?cardView({id:"back",suit:"",rank:0,up:false}):<div className="card-slot">↻</div>}</button><button className="card-button" onClick={selectWaste} aria-label={state.waste.length?`Select waste ${rankLabel(state.waste.at(-1)!.rank)} ${state.waste.at(-1)!.suit}`:"Empty waste"} data-testid="solitaire-waste">{state.waste.length?cardView(state.waste.at(-1)!,selection?.kind==="waste"):<div className="card-slot"/>}</button></div><div className="card-row foundations">{suits.map(suit=><button className="card-button" key={suit} onClick={()=>moveToFoundation(suit)} aria-label={`${suit} foundation`}>{state.foundations[suit]?.length?cardView(state.foundations[suit].at(-1)!):<div className="card-slot suit-slot">{suit}</div>}</button>)}</div></div><div className="tableau" role="group" aria-label="Solitaire tableau">{state.cols.map((col,colIndex)=><button className="tableau-column" key={colIndex} aria-label={`Tableau column ${colIndex+1}`} onClick={()=>tapColumn(colIndex)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const raw=event.dataTransfer.getData("text/plain").split(":").map(Number);if(raw.length===2)moveTableau(raw[0],raw[1],colIndex)}}>{col.map((card,index)=><span className="tableau-card" key={card.id} style={{top:index*24}} draggable={card.up} onDragStart={event=>{if(!validSequence(col.slice(index))){event.preventDefault();return}event.stopPropagation();event.dataTransfer.setData("text/plain",`${colIndex}:${index}`)}} onClick={event=>{event.stopPropagation();selectTableau(colIndex,index)}}>{cardView(card,selection?.kind==="tableau"&&selection.col===colIndex&&selection.index===index)}</span>)}</button>)}</div><p className="muted solitaire-help">Tap a face-up card or ordered stack, then tap its destination. Tap a foundation after selecting a top card. Desktop drag remains available.</p>{won&&<h2 role="status">You completed the deck!</h2>}</div></GameShell>;
}
