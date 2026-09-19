import { type State, starsFor } from './engine';
export type Record = { score: number; stars: number; completed: boolean };
export type Progress = { version: 1; unlocked: number; records: { [level: string]: Record } };
export const emptyProgress: Progress = { version: 1, unlocked: 1, records: {} };
export function restoreProgress(value: unknown): Progress {
  if (!value || typeof value !== 'object') return emptyProgress;
  const v = value as Partial<Progress>, records: Progress['records'] = {};
  for (const [key, record] of Object.entries(v.records || {})) if (Number.isInteger(+key) && +key >= 1 && +key <= 30 && record && Number.isFinite(record.score) && Number.isFinite(record.stars)) {
    records[key] = { score: Math.max(0, record.score), stars: Math.max(0, Math.min(3, Math.floor(record.stars))), completed: record.completed === true };
  }
  let unlocked = 1;
  while (unlocked < 30 && records[unlocked]?.completed) unlocked++;
  return { version: 1, unlocked, records };
}
export function saveResult(progress: Progress, state: State): Progress {
  const previous = progress.records[state.level];
  return { version: 1, unlocked: state.status === 'win' ? Math.max(progress.unlocked, Math.min(30, state.level + 1)) : progress.unlocked,
    records: { ...progress.records, [state.level]: { score: Math.max(previous?.score || 0, state.score), stars: Math.max(previous?.stars || 0, starsFor(state)), completed: Boolean(previous?.completed || state.status === 'win') } } };
}
