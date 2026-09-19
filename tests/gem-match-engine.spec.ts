import { test, expect } from '@playwright/test';
import { canSwap, createState, findMatches, finishState, legalMoves, playTurn, reshuffle, starsFor, type Board, type State } from '../src/games/gem-match/engine';
import { levels } from '../src/games/gem-match/levels';
import { emptyProgress, restoreProgress, saveResult } from '../src/games/gem-match/progress';
function board(): Board { return Array.from({length:64},(_,i)=>({id:i+1,color:(Math.floor(i/8)*2+i%8)%6})); }
function shape(cells:number[]) { const b=board(); cells.forEach(i=>b[i]!.color=5); return b; }
function setup(b:Board): State { return {...createState(30,42),board:b,obstacles:Array(64).fill(0)}; }
test('initial boards are clean, full and playable for all 30 levels and many seeds',()=>{
 for(const l of levels) for(let seed=1;seed<=12;seed++) {const s=createState(l.level,seed);expect(findMatches(s.board)).toEqual([]);expect(legalMoves(s.board).length).toBeGreaterThan(0);expect(new Set(s.board.map(g=>g?.id)).size).toBe(64);}
 expect(levels).toHaveLength(30);expect(new Set(levels.slice(10).map(l=>JSON.stringify(l.obstacles))).size).toBeGreaterThan(5);
 expect(levels.slice(0,5).every(l=>l.goals.length===1&&!l.obstacles.some(Boolean))).toBe(true);
 expect(levels.slice(20).every(l=>l.obstacles.includes(2))).toBe(true);
});
test('detects match 3, horizontal/vertical 4, 5, T and L shapes',()=>{
 for(const [cells,special] of [[[16,17,18],undefined],[[16,17,18,19],'row'],[[2,10,18,26],'column'],[[16,17,18,19,20],'color'],[[17,18,19,10,26],'bomb'],[[17,18,19,25,33],'bomb']] as [number[],string|undefined][]) {
 const match=findMatches(shape(cells)).find(m=>cells.every(i=>m.cells.includes(i)));expect(match).toBeDefined();expect(match?.special).toBe(special);
 }
});
test('valid exchanges resolve, invalid swaps restore exactly and do not mutate input',()=>{
 const s=createState(30,56), original=JSON.stringify(s), [a,b]=legalMoves(s.board)[0];
 const valid=playTurn(s,a,b);expect(valid.valid).toBe(true);expect(valid.state.moves).toBe(s.moves-1);expect(valid.state.score).toBeGreaterThan(0);expect(findMatches(valid.state.board)).toEqual([]);expect(JSON.stringify(s)).toBe(original);
 let invalid:[number,number]|undefined;for(let i=0;i<63;i++)if(i%8<7&&!canSwap(s.board,i,i+1)){invalid=[i,i+1];break;}
 expect(invalid).toBeDefined();const restored=playTurn(s,...invalid!);expect(restored.valid).toBe(false);expect(restored.state).toEqual(s);expect(restored.frames.map(f=>f.phase)).toEqual(['swap','restore']);expect(playTurn(s,7,8).frames).toEqual([]);
});
test('match recipes actually create and retain special gems after gravity',()=>{
 for(const [cells,special,from,to] of [[[16,17,18,19],'row',11,19],[[16,17,18,19,20],'color',12,20],[[17,18,19,10,26],'bomb',11,19]] as [number[],string,number,number][]) {
 const b=shape(cells);[b[from],b[to]]=[b[to],b[from]];
 const turn=playTurn(setup(b),from,to);expect(turn.valid).toBe(true);
 expect(turn.frames.filter(f=>f.phase==='fall').some(f=>f.state.board.some(g=>g?.special===special))).toBe(true);
 }
});
test('cascades refill full board with unique identities and growing combo scoring',()=>{
 let cascade:ReturnType<typeof playTurn>|undefined;
 for(let seed=1;seed<100&&!cascade;seed++){const s=createState(30,seed);const t=playTurn(s,...legalMoves(s.board)[0]);if(t.frames.some(f=>f.combo>=2))cascade=t;}
 expect(cascade).toBeDefined();expect(cascade!.state.board.filter(Boolean)).toHaveLength(64);expect(new Set(cascade!.state.board.map(g=>g?.id)).size).toBe(64);expect(cascade!.frames.filter(f=>f.phase==='match')[1].points).toBeGreaterThanOrEqual(360);
});
test('dead boards reshuffle without changing goals, seals or identities; pathological distributions recover',()=>{
 const b=Array.from({length:64},(_,i)=>({id:i+1,color:(Math.floor(i/8)+i%8)%6}));expect(legalMoves(b)).toEqual([]);
 const s=setup(b), shuffled=reshuffle(s);expect(legalMoves(shuffled.board).length).toBeGreaterThan(0);expect(findMatches(shuffled.board)).toEqual([]);expect(shuffled.obstacles).toEqual(s.obstacles);expect(shuffled.moves).toBe(s.moves);expect(shuffled.board.map(g=>g!.id).sort()).toEqual(s.board.map(g=>g!.id).sort());
 const pathological=setup(Array.from({length:64},(_,i)=>({id:i+1,color:0,...(i===0?{special:'bomb' as const}:{})})));const recovered=reshuffle(pathological);expect(findMatches(recovered.board)).toEqual([]);expect(legalMoves(recovered.board).length).toBeGreaterThan(0);expect(recovered.board.some(g=>g?.special==='bomb')).toBe(true);
});
test('special swaps activate line, bomb, color, all combinations and chain once',()=>{
 const pairs=[['row','column'],['bomb','bomb'],['row','bomb'],['color','row'],['color','bomb'],['color','color']] as const;
 for(const [first,second] of pairs){const s=createState(30,54);s.board[27]!.special=first;s.board[28]!.special=second;const t=playTurn(s,27,28);expect(t.valid).toBe(true);const f=t.frames.find(f=>f.phase==='match')!;expect(f.cells.length).toBeGreaterThanOrEqual(8);expect(new Set(f.activated).size).toBe(f.activated.length);if(first==='color'&&second==='color')expect(f.cells).toHaveLength(64);}
 const s=createState(30,55);s.board[27]!.special='color';const target=s.board[28]!.color;const t=playTurn(s,27,28);const wave=t.frames.find(f=>f.phase==='match')!;expect(wave.cells.every(i=>i===27||i===28||wave.state.board[i]?.color===target)).toBe(true);
});
test('matched specials activate and obstacle layers only decrement once per wave',()=>{
 const b=shape([16,17,18]);b[17]!.special='row';[b[10],b[18]]=[b[18],b[10]];const s=setup(b);s.obstacles[16]=2;s.obstacles[23]=1;
 const t=playTurn(s,10,18), wave=t.frames.find(f=>f.phase==='match')!;expect(wave.activated).toContain(17);expect(wave.cells).toEqual(expect.arrayContaining([16,23]));expect(wave.state.obstacles[16]).toBe(1);expect(wave.state.obstacles[23]).toBe(0);expect(wave.state.cleared).toBe(1);
});
test('wins require every goal and take precedence on last move; failure is terminal',()=>{
 let s=createState(16);s.score=100000;s.moves=0;expect(finishState(s).status).toBe('loss');s={...s,collected:Array(6).fill(1000),cleared:64};expect(finishState(s).status).toBe('win');expect(playTurn(finishState(s),0,1).frames).toEqual([]);
});
test('stars, sequential unlocks, best records and storage restoration preserve progress',()=>{
 const s={...createState(1),score:levels[0].targetScore,moves:0,status:'win' as const};expect(starsFor(s)).toBe(1);expect(starsFor({...s,moves:10})).toBe(2);expect(starsFor({...s,moves:25})).toBe(3);expect(starsFor({...s,status:'loss'})).toBe(0);
 const first=saveResult(emptyProgress,{...s,moves:25});expect(first.unlocked).toBe(2);expect(restoreProgress(JSON.parse(JSON.stringify(first)))).toEqual(first);
 const replay=saveResult(first,{...s,status:'loss',score:1});expect(replay.records[1]).toEqual(first.records[1]);expect(replay.unlocked).toBe(2);expect(restoreProgress(null)).toEqual(emptyProgress);expect(restoreProgress({unlocked:30,records:{}}).unlocked).toBe(1);
});
