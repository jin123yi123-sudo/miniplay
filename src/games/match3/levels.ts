export type Goal = { type: 'score'; target: number } | { type: 'collect'; color: number; target: number } | { type: 'clear'; target: number };
export type Level = { level: number; moves: number; targetScore: number; goals: Goal[]; obstacles: number[] };
const patterns = ['corners', 'cross', 'rings', 'stairs', 'islands'] as const;
function obstacleMap(pattern: typeof patterns[number], layered: boolean): number[] {
  return Array.from({ length: 64 }, (_, i) => {
    const r = Math.floor(i / 8), c = i % 8;
    const hit = pattern === 'corners' ? (r < 2 || r > 5) && (c < 2 || c > 5)
      : pattern === 'cross' ? r === 3 || c === 4
      : pattern === 'rings' ? (r === 1 || r === 6) && c > 0 && c < 7 || (c === 1 || c === 6) && r > 1 && r < 6
      : pattern === 'stairs' ? r === c || r === c + 1
      : (r % 3 === 1 && c % 3 === 1) || (r === 6 && c > 1 && c < 6);
    return hit ? layered && (r + c) % 2 === 0 ? 2 : 1 : 0;
  });
}
// Six five-level chapters reuse the rules with new goals and obstacle arrangements.
export const levels: Level[] = Array.from({ length: 30 }, (_, index) => {
  const n = index + 1, chapter = Math.floor(index / 5), variant = index % 5;
  const moves = n <= 5 ? 25 : n <= 10 ? 26 : n <= 20 ? 28 : 27;
  const targetScore = n <= 5 ? 450 + variant * 180 : 1500 + (n - 6) * 100;
  const obstacles = n >= 11 ? obstacleMap(patterns[variant], n >= 21) : Array(64).fill(0);
  const goals: Goal[] = [{ type: 'score', target: targetScore }];
  if (n >= 6) goals.push({ type: 'collect', color: index % 6, target: 12 + chapter * 4 + variant * 2 });
  if (n >= 16 || n === 9 || n === 10) goals.push({ type: 'collect', color: (index + 2) % 6, target: 10 + chapter * 3 });
  if (n >= 11) goals.push({ type: 'clear', target: obstacles.filter(Boolean).length });
  return { level: n, moves, targetScore, goals, obstacles };
});
