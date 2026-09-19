import { type Level, levels } from './levels';
export const SIZE = 8;
export type Special = 'row' | 'column' | 'bomb' | 'color';
export type Gem = { id: number; color: number; special?: Special };
export type Board = Array<Gem | null>;
export type State = { board: Board; obstacles: number[]; score: number; moves: number; collected: number[]; cleared: number; rng: number; nextId: number; status: 'playing' | 'win' | 'loss'; level: number };
export type Match = { cells: number[]; special?: Special };
export type Frame = { state: State; phase: 'swap' | 'restore' | 'match' | 'fall' | 'shuffle'; cells: number[]; combo: number; points: number; activated: number[] };
export type Turn = { valid: boolean; state: State; frames: Frame[] };
export function adjacent(a: number, b: number) { return a >= 0 && b >= 0 && a < 64 && b < 64 && (Math.floor(a / 8) === Math.floor(b / 8) && Math.abs(a - b) === 1 || Math.abs(a - b) === 8); }
export function findMatches(board: Board): Match[] {
  const runs: { cells: number[]; direction: 'row' | 'column' }[] = [];
  for (const direction of ['row', 'column'] as const) for (let line = 0; line < 8; line++) {
    let run: number[] = [];
    const finish = () => { if (run.length >= 3) runs.push({ cells: run, direction }); };
    for (let k = 0; k < 8; k++) {
      const i = direction === 'row' ? line * 8 + k : k * 8 + line;
      if (run.length && (!board[i] || board[i]?.special === 'color' || board[i]?.color !== board[run[0]]?.color)) { finish(); run = []; }
      if (board[i] && board[i]?.special !== 'color') run.push(i);
    }
    finish();
  }
  const groups: typeof runs[] = [];
  for (const run of runs) {
    const touching = groups.filter(g => g.some(r => r.cells.some(i => run.cells.includes(i))));
    const merged = [run, ...touching.flat()];
    for (const g of touching) groups.splice(groups.indexOf(g), 1);
    groups.push(merged);
  }
  return groups.map(group => ({ cells: [...new Set(group.flatMap(r => r.cells))],
    special: group.some(r => r.cells.length >= 5) ? 'color' : group.some(r => r.direction !== group[0].direction) ? 'bomb' : group.some(r => r.cells.length === 4) ? group[0].direction : undefined }));
}
function swapped(board: Board, a: number, b: number) { const next = [...board]; [next[a], next[b]] = [next[b], next[a]]; return next; }
export function canSwap(board: Board, a: number, b: number) {
  if (!adjacent(a, b) || !board[a] || !board[b]) return false;
  if (board[a]?.special === 'color' || board[b]?.special === 'color' || board[a]?.special && board[b]?.special) return true;
  return findMatches(swapped(board, a, b)).some(m => m.cells.includes(a) || m.cells.includes(b));
}
export function legalMoves(board: Board): [number, number][] {
  const moves: [number, number][] = [];
  for (let i = 0; i < 64; i++) for (const j of [i % 8 < 7 ? i + 1 : -1, i + 8]) if (canSwap(board, i, j)) moves.push([i, j]);
  return moves;
}
function random(s: State) { s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0; return s.rng / 4294967296; }
function fresh(s: State): Gem { return { id: s.nextId++, color: Math.floor(random(s) * 6) }; }
function clone(s: State): State { return { ...s, board: s.board.map(g => g ? { ...g } : null), obstacles: [...s.obstacles], collected: [...s.collected] }; }
export function reshuffle(state: State): State {
  const s = clone(state), gems = s.board.filter((g): g is Gem => Boolean(g));
  for (let attempt = 0; attempt < 300; attempt++) {
    for (let i = gems.length - 1; i > 0; i--) { const j = Math.floor(random(s) * (i + 1)); [gems[i], gems[j]] = [gems[j], gems[i]]; }
    s.board = [...gems];
    if (s.board.length === 64 && !findMatches(s.board).length && legalMoves(s.board).length) return s;
  }
  // Pathological color distributions cannot be shuffled: recolor, retaining special identities and seals.
  do {
    s.board = [];
    for (let i = 0; i < 64; i++) {
      const gem = gems[i] ? { ...gems[i] } : fresh(s);
      do { gem.color = Math.floor(random(s) * 6); }
      while (i % 8 >= 2 && s.board[i - 1]?.color === gem.color && s.board[i - 2]?.color === gem.color || i >= 16 && s.board[i - 8]?.color === gem.color && s.board[i - 16]?.color === gem.color);
      s.board.push(gem);
    }
  } while (findMatches(s.board).length || !legalMoves(s.board).length);
  return s;
}
export function createState(level: number, seed = 1731 + level * 937): State {
  const config = levels[level - 1];
  if (!config) throw new Error('Unknown level');
  const s: State = { board: Array(64).fill(null), obstacles: [...config.obstacles], score: 0, moves: config.moves, collected: Array(6).fill(0), cleared: 0, rng: seed >>> 0, nextId: 1, status: 'playing', level };
  for (let i = 0; i < 64; i++) {
    let g = fresh(s);
    while (i % 8 >= 2 && s.board[i - 1]?.color === g.color && s.board[i - 2]?.color === g.color || i >= 16 && s.board[i - 8]?.color === g.color && s.board[i - 16]?.color === g.color) g = fresh(s);
    s.board[i] = g;
  }
  return legalMoves(s.board).length ? s : reshuffle(s);
}
export function goalValue(s: State, goal: Level['goals'][number]) { return goal.type === 'score' ? s.score : goal.type === 'clear' ? s.cleared : s.collected[goal.color]; }
export function finishState(s: State): State {
  const win = levels[s.level - 1].goals.every(g => goalValue(s, g) >= g.target);
  return { ...s, status: win ? 'win' : s.moves <= 0 ? 'loss' : 'playing' };
}
export function starsFor(s: State): number {
  if (s.status !== 'win') return 0;
  const config = levels[s.level - 1], rating = s.score / config.targetScore + s.moves / config.moves;
  return rating >= 1.8 ? 3 : rating >= 1.35 ? 2 : 1;
}
function area(i: number, radius: number) { const r = Math.floor(i / 8), c = i % 8; return Array.from({ length: 64 }, (_, j) => j).filter(j => Math.abs(Math.floor(j / 8) - r) <= radius && Math.abs(j % 8 - c) <= radius); }
function line(i: number, direction: 'row' | 'column') { return Array.from({ length: 8 }, (_, k) => direction === 'row' ? Math.floor(i / 8) * 8 + k : k * 8 + i % 8); }
export function playTurn(state: State, a: number, b: number): Turn {
  if (state.status !== 'playing' || !adjacent(a, b)) return { valid: false, state, frames: [] };
  const s = clone(state), frames: Frame[] = [];
  const addFrame = (phase: Frame['phase'], cells: number[] = [], combo = 0, points = 0, activated: number[] = []) => frames.push({ state: clone(s), phase, cells, combo, points, activated });
  s.board = swapped(s.board, a, b); addFrame('swap', [a, b]);
  if (!canSwap(state.board, a, b)) { s.board = swapped(s.board, a, b); addFrame('restore', [a, b]); return { valid: false, state, frames }; }
  s.moves--;
  const ga = s.board[a]!, gb = s.board[b]!;
  let combo = 0;
  let forced: number[] = [];
  const paired = Boolean(ga.special && gb.special);
  if (ga.special === 'color' || gb.special === 'color') {
    const colorIndex = ga.special === 'color' ? a : b, other = colorIndex === a ? gb : ga;
    if (other.special !== 'color') s.board[colorIndex] = { ...s.board[colorIndex]!, color: other.color };
    forced = s.board.flatMap((g, i) => g && (other.special === 'color' || g.color === other.color || i === a || i === b) ? [i] : []);
    if (other.special && other.special !== 'color') for (const i of forced) if (i !== colorIndex && s.board[i]) s.board[i] = { ...s.board[i]!, special: other.special };
  } else if (paired) {
    forced = ga.special === 'bomb' && gb.special === 'bomb' ? [...area(a, 2), ...area(b, 2)]
      : ga.special === 'bomb' || gb.special === 'bomb' ? area(a, 1).flatMap(i => [...line(i, 'row'), ...line(i, 'column')])
      : [...line(a, 'row'), ...line(a, 'column'), ...line(b, 'row'), ...line(b, 'column')];
  }
  while (combo < 100) {
    const matches = findMatches(s.board);
    if (!matches.length && !forced.length) break;
    combo++;
    const clear = new Set([...forced, ...matches.flatMap(m => m.cells)]), creates = new Map<number, Special>();
    if (!forced.length) for (const m of matches) if (m.special && !m.cells.some(i => s.board[i]?.special)) {
      const anchor = combo === 1 && m.cells.includes(b) ? b : combo === 1 && m.cells.includes(a) ? a : m.cells[Math.floor(m.cells.length / 2)];
      creates.set(anchor, m.special);
    }
    const activated: number[] = [], triggered = new Set<number>();
    // Iterate growing set: specials hit by other effects chain exactly once per wave.
    for (const i of clear) {
      const gem = s.board[i];
      if (!gem?.special || triggered.has(i)) continue;
      triggered.add(i); activated.push(i);
      const effect = gem.special === 'bomb' ? area(i, 1) : gem.special === 'row' || gem.special === 'column' ? line(i, gem.special)
        : s.board.flatMap((g, j) => g?.color === gem.color ? [j] : []);
      effect.forEach(j => clear.add(j));
    }
    // A created gem survives its own match, but not an overlapping special blast.
    if (activated.length) creates.clear();
    const cells = [...clear], points = cells.length * 60 * Math.min(combo, 5) + activated.length * 120;
    s.score += points;
    for (const i of cells) {
      const gem = s.board[i];
      if (gem) s.collected[gem.color]++;
      if (s.obstacles[i] > 0) { s.obstacles[i]--; if (!s.obstacles[i]) s.cleared++; }
    }
    addFrame('match', cells, combo, points, activated);
    for (const i of cells) { const gem = s.board[i]; s.board[i] = creates.has(i) && gem ? { ...gem, special: creates.get(i) } : null; }
    for (let c = 0; c < 8; c++) {
      const column = Array.from({ length: 8 }, (_, r) => s.board[r * 8 + c]).filter((g): g is Gem => Boolean(g));
      const missing = 8 - column.length;
      for (let r = 0; r < 8; r++) s.board[r * 8 + c] = r < missing ? fresh(s) : column[r - missing];
    }
    addFrame('fall', [], combo); forced = [];
  }
  if (findMatches(s.board).length || !legalMoves(s.board).length) { Object.assign(s, reshuffle(s)); addFrame('shuffle'); }
  const result = finishState(s);
  return { valid: true, state: result, frames };
}
