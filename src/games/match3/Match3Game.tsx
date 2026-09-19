"use client";
import { useEffect, useRef, useState } from 'react';
import { getStored, setStored } from '@/lib/storage';
import { trackGameEvent } from '@/lib/analytics';
import { createState, goalValue, legalMoves, playTurn, starsFor, type Frame, type State } from './engine';
import { levels } from './levels';
import { emptyProgress, restoreProgress, saveResult } from './progress';
import { themeStyle, type Match3Theme, type ThemeStyle } from './theme';
import styles from './Match3Game.module.css';
import{useI18n}from'@/i18n/LocaleContext';import{localizeTheme}from'./theme';

function lessonFor(theme: Match3Theme, level: number,locale:'en'|'zh-CN') {
  if(locale==='zh-CN')return level===1?'依次点击两个相邻棋子。连接三个同类；无效交换不会消耗步数。':level===2?`四连可制造${theme.specials.row}，清除方向取决于匹配方向。`:level===3?`直线五连可制造${theme.specials.color}，与相邻棋子交换即可清除同类。`:level===4?`T 形或 L 形匹配可制造${theme.specials.bomb}，匹配或组合特殊棋子即可触发。`:level===5?'观察匹配下方：下落棋子可能形成连锁并提高得分倍率。':level<=10?'完成全部目标，在收集指定棋子的同时规划特殊棋子。':level<=20?`${theme.obstacleName}位于棋子下方，清除对应格或使用特殊效果可移除一层。`:`双层${theme.obstacleName}需要分两次命中，组合特殊棋子可覆盖困难角落。`;
  return level === 1 ? 'Tap a piece, then a neighbor. Match three; invalid swaps cost no moves.'
    : level === 2 ? `Match four to make a ${theme.specials.row}. Match direction determines its sweep.`
    : level === 3 ? `Match five in a straight line to make a ${theme.specials.color}. Swap it with any neighboring piece.`
    : level === 4 ? `Intersecting T or L matches make a ${theme.specials.bomb}. Match or combine specials to activate them.`
    : level === 5 ? 'Look below a match: falling pieces can create a cascade for a score multiplier.'
    : level <= 10 ? 'Complete every goal. Collect the named pieces while planning specials.'
    : level <= 20 ? `${theme.obstacleName[0].toUpperCase()+theme.obstacleName.slice(1)} sit beneath pieces. Each clear touching their cell removes one layer.`
    : `Double-layer ${theme.obstacleName} need two separate hits. Combine specials to reach difficult corners.`;
}
function visualAsset(theme:Match3Theme,color:number,special?:'row'|'column'|'bomb'|'color'){
  return special==='row'?theme.specials.rowAsset:special==='column'?theme.specials.columnAsset:special==='bomb'?theme.specials.bombAsset:special==='color'?theme.specials.colorAsset:theme.pieces[color].asset;
}
export default function Match3Game({theme:sourceTheme}:{theme:Match3Theme}) {
  const{locale,t}=useI18n(),theme=localizeTheme(sourceTheme,locale),zh=locale==='zh-CN';
  const params = { game_name: sourceTheme.name, game_slug: sourceTheme.analyticsSlug,...(locale==='zh-CN'?{locale}as const:{}) };
  const progressKey = `${theme.storageNamespace}:progress`, soundKey = `${theme.storageNamespace}:sound`;
  const [state, setState] = useState<State>(() => createState(1));
  const [progress, setProgress] = useState(() => restoreProgress(getStored(progressKey, emptyProgress)));
  const [select, setSelect] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [hint, setHint] = useState<number[]>([]);
  const [sound, setSound] = useState(() => getStored<boolean>(soundKey, false) === true);
  const [storageWarning, setStorageWarning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState(zh?'请选择关卡开始游戏。':'Choose a level to begin.');
  const token = useRef(0), working = useRef(false), started = useRef(false), terminal = useRef(false), attempt = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => { setStored('recent', [theme.id, ...getStored<string[]>('recent', []).filter(id => id !== theme.id)].slice(0, 8)); }, [theme.id]);
  useEffect(() => () => { token.current++; void audio.current?.close(); }, []);
  function tone(kind: 'match' | 'win' | 'loss', combo = 1) {
    if (!sound || !audio.current || audio.current.state !== 'running') return;
    try {
      const ctx = audio.current, now = ctx.currentTime;
      const notes = kind === 'win' ? theme.audio?.win||[523, 659, 784, 1046] : kind === 'loss' ? theme.audio?.loss||[220, 165] : [(theme.audio?.matchBase||330) + Math.min(combo, 6) * 70];
      notes.forEach((frequency, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain(), at = now + i * .10;
        osc.type = 'sine'; osc.frequency.value = frequency; gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(.055, at + .01); gain.gain.exponentialRampToValueAtTime(.001, at + .15);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(at); osc.stop(at + .16);
      });
    } catch { /* Sound is optional, including in restricted browsers. */ }
  }
  function unlockAudio() {
    if (!sound) return;
    try { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {}); } catch { /* Silent fallback. */ }
  }
  function begin(level: number) {
    token.current++; working.current = false; started.current = false; terminal.current = false;
    setBusy(false); setFrame(null); setSelected(null); setHint([]); setSelect(false);
    setState(createState(level, 1731 + level * 937 + attempt.current++ * 7919));
    setAnnouncement(`${zh?'关卡':'Level'} ${level}。${lessonFor(theme, level,locale)}`);
  }
  function restart() { trackGameEvent('game_restart', params); begin(state.level); }
  function levelSelect() {
    token.current++; working.current = false; setBusy(false); setFrame(null); setSelected(null); setHint([]); setSelect(true);
    setAnnouncement(zh?'请选择已解锁关卡。离开关卡不会保存尚未完成的棋盘。':'Choose an unlocked level. Leaving a level does not save an unfinished board.');
  }
  async function choose(index: number) {
    if (working.current || state.status !== 'playing') return;
    unlockAudio();
    if (selected === null || selected === index) { setSelected(selected === index ? null : index); return; }
    const turn = playTurn(state, selected, index);
    if (!turn.frames.length) { setSelected(index); return; }
    setSelected(null); setHint([]); working.current = true; setBusy(true);
    const round = token.current;
    if (turn.valid && !started.current) {
      started.current = true;
      trackGameEvent('game_start', params);
      trackGameEvent('level_start', { ...params, level: state.level });
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const next of turn.frames) {
      if (round !== token.current) return;
      setFrame(next); setState(next.state);
      if (next.phase === 'match') { tone('match', next.combo); setAnnouncement(zh?`${next.combo>1?`连锁 ${next.combo}。`:''}获得 ${next.points} 分。${next.activated.length?'特殊棋子已触发。':''}`:`${next.combo > 1 ? `Cascade ${next.combo}. ` : ''}${next.points} points. ${next.activated.length ? 'Special pieces activated.' : ''}`); }
      if (next.phase === 'shuffle') setAnnouncement(zh?'当前没有可行移动，棋盘已自动重排且不消耗步数。':'No available matches. Board reshuffled without using a move.');
      await new Promise(resolve => setTimeout(resolve, reduced ? 0 : next.phase === 'match' ? 230 : next.phase === 'fall' ? 260 : 180));
    }
    if (round !== token.current) return;
    setState(turn.state); setFrame(null); setBusy(false); working.current = false;
    if (!turn.valid) { setAnnouncement(zh?'这次交换没有形成匹配，不消耗步数。':'That swap makes no match. No move used.'); return; }
    if (turn.state.status !== 'playing' && !terminal.current) {
      terminal.current = true;
      const won = turn.state.status === 'win', stars = starsFor(turn.state);
      const next = saveResult(progress, turn.state); setProgress(next);
      setStorageWarning(!setStored(progressKey, next));
      trackGameEvent('game_complete', { ...params, result: won ? 'win' : 'loss', level: turn.state.level, score: turn.state.score, stars, moves: turn.state.moves, moves_remaining: turn.state.moves });
      trackGameEvent(won ? 'level_complete' : 'level_fail', { ...params, level: turn.state.level, score: turn.state.score, stars, moves: turn.state.moves, moves_remaining: turn.state.moves });
      setAnnouncement(won ? (zh?`过关成功！获得 ${stars} 星。`:`Level complete! ${stars} stars.`) : (zh?'步数用完了，换一种策略再试试。':'Out of moves. Try a different strategy.')); tone(won ? 'win' : 'loss');
    }
  }
  const config = levels[state.level - 1], won = state.status === 'win';
  return <div className={styles.game} style={themeStyle(theme)} data-theme={theme.slug}>
      <div className={styles.brand}><span className={styles.spark}>{theme.cover.symbol}</span><div><strong>{theme.name}</strong><small>{theme.tagline}</small></div><span className={styles.chapter}>{zh?'30 关':'30 levels'}</span></div>
      <p className={styles.live} aria-live="polite" role="status">{announcement}</p>
      {storageWarning && <p role="alert">{zh?'浏览器存储不可用，进度只能保留到关闭页面为止。':'Browser storage is unavailable. Progress will last only until this page closes.'}</p>}
      {select ? <section aria-label={t.game.levelSelect}><h2 className={styles.heading}>{t.game.levelSelect}</h2><p className={styles.subtitle}>{theme.levelSelectCopy}</p><div className={styles.levels}>{levels.map(level => {
        const record = progress.records[level.level], locked = level.level > progress.unlocked;
        return <button key={level.level} disabled={locked} className={styles.level} onClick={() => begin(level.level)} aria-label={`${zh?'关卡':'Level'} ${level.level}${locked ? zh?', 未解锁':', locked' : record?.completed ? zh?`, 已完成，${record.stars} 星`:`, completed, ${record.stars} stars` : zh?', 已解锁':', unlocked'}`}><strong>{locked ? '🔒' : level.level}</strong><span>{record?.stars ? '★'.repeat(record.stars) : '☆☆☆'}</span><small>{record ? record.score.toLocaleString() : locked ? t.game.locked : t.game.ready}</small></button>;
      })}</div><p className={styles.subtitle}>{zh?'1–5 · 基础 / 6–10 · 颜色技巧 / 11–20 · 障碍路线 / 21–30 · 深度策略':'1–5 · Foundations / 6–10 · Color craft / 11–20 · Seal trails / 21–30 · Deep strategy'}</p></section> : <>
        <div className={styles.stats}><div><small>{t.game.level}</small><strong>{state.level}</strong></div><div><small>{t.game.score}</small><strong>{state.score.toLocaleString()}</strong></div><div><small>{t.game.moves}</small><strong>{state.moves}</strong></div></div>
        <section className={styles.goals} aria-label={t.game.goals}><strong>{t.game.goals}</strong>{config.goals.map((goal, i) => <div key={i} className={styles.goal}><span>{goal.type === 'score' ? t.game.score : goal.type === 'clear' ? `${zh?'清除':'Break'} ${theme.obstacleName}` : `${theme.pieces[goal.color].symbol} ${theme.pieces[goal.color].name}`}</span><span>{Math.min(goalValue(state, goal), goal.target)} / {goal.target} {goalValue(state, goal) >= goal.target ? '✓' : ''}</span><progress max={goal.target} value={goalValue(state, goal)} aria-label={zh?`${t.game.goal}进度`:`${goal.type} goal progress`}/></div>)}</section>
        <p className={styles.lesson}>{lessonFor(theme,state.level,locale)}</p>
        <div className={`${styles.board} ${frame?.phase === 'shuffle' ? styles.shuffle : ''}`} style={theme.artwork.boardBackground?{backgroundImage:`url(${theme.artwork.boardBackground})`}:undefined} role="group" aria-label={theme.boardLabel||`${theme.name} board`} aria-busy={busy}>
          {state.obstacles.map((layers, i) => layers > 0 && <span key={i} className={styles.seal} style={{left:`${i % 8 * 12.5}%`,top:`${Math.floor(i / 8) * 12.5}%`}} aria-hidden="true">{layers === 2 ? '▣' : '□'}</span>)}
          {state.board.map((gem, i) => gem && <button key={gem.id} data-cell={i} data-color={gem.color} data-special={gem.special ?? ''} data-hint={hint.includes(i) ? 'true' : undefined} aria-label={`Row ${Math.floor(i / 8) + 1} column ${i % 8 + 1}, ${theme.pieces[gem.color].name}${gem.special ? ` ${theme.specials[gem.special]}` : ''}${state.obstacles[i] ? `, ${state.obstacles[i]} ${theme.obstacleName} layers` : ''}`} aria-pressed={selected === i} disabled={state.status !== 'playing'} onClick={() => void choose(i)} className={`${styles.cell} ${selected === i ? styles.selected : ''} ${hint.includes(i) ? styles.hint : ''} ${frame?.phase === 'match' && frame.cells.includes(i) ? styles.matched : ''} ${frame?.activated.includes(i) ? styles.activated : ''}`} style={{left:`${i % 8 * 12.5}%`,top:`${Math.floor(i / 8) * 12.5}%`,"--light":theme.pieces[gem.color].light,"--dark":theme.pieces[gem.color].dark} as ThemeStyle}><span className={styles.gem} style={visualAsset(theme,gem.color,gem.special)?{backgroundImage:`url(${visualAsset(theme,gem.color,gem.special)})`,backgroundSize:'cover'}:undefined}>{!visualAsset(theme,gem.color,gem.special)&&(gem.special === 'color' ? theme.specials.colorSymbol : theme.pieces[gem.color].symbol)}{!visualAsset(theme,gem.color,gem.special)&&gem.special && gem.special !== 'color' && <b className={styles.special}>{gem.special === 'bomb' ? theme.specials.bombSymbol : gem.special === 'row' ? theme.specials.rowSymbol : theme.specials.columnSymbol}</b>}</span></button>)}
          {frame?.phase === 'match' && <div key={`${state.score}`} className={styles.popup} aria-hidden="true"><strong>+{frame.points}</strong>{frame.combo > 1 && <span>{zh?'连锁':'CASCADE'} ×{frame.combo}</span>}{frame.activated.length > 0 && <span>{theme.powerCallout}</span>}</div>}
        </div>
        <div className={styles.actions}><button className="btn secondary" onClick={restart}>{t.game.restart}</button><button className="btn secondary" onClick={levelSelect}>{t.game.levelSelect}</button><button className="btn secondary" disabled={busy || state.status !== 'playing'} onClick={() => {setHint(legalMoves(state.board)[0] ?? []); setAnnouncement(zh?'高亮棋子可以形成匹配，使用提示不消耗步数。':'Highlighted gems can make a match. Hints cost no moves.');}}>{t.game.hint}</button></div>
        {state.status !== 'playing' && <section className={`${styles.result} ${won ? styles.success : styles.failure}`} aria-label={won ? t.game.levelComplete : t.game.outOfMoves}><h2>{won ? t.game.levelComplete : t.game.outOfMoves}</h2><div className={styles.stars} aria-label={zh?`${starsFor(state)} 星`:`${starsFor(state)} stars`}>{won ? '★'.repeat(starsFor(state)) + '☆'.repeat(3 - starsFor(state)) : '◇'}</div><p>{t.game.score}: {state.score.toLocaleString()}{won ? (zh?` · 剩余 ${state.moves} 步`:` · ${state.moves} moves remaining`) : (zh?' · 每一步都可以重新规划。':' · Every move is a fresh decision.')}</p><div className={styles.actions}>{won && state.level < 30 && <button className="btn" onClick={() => begin(state.level + 1)}>{t.game.nextLevel}</button>}<button className="btn secondary" onClick={restart}>{won ? t.game.replay : t.game.retry}</button><button className="btn secondary" onClick={levelSelect}>{t.game.levelSelect}</button></div>{won && state.level === 30 && <p>{zh?'全部 30 关已完成！重玩喜欢的关卡来提高星级吧。':'All 30 levels complete! Replay your favorites to improve your stars.'}</p>}</section>}
      </>}
      <div className={styles.footer}><span>{zh?`依次点击棋子和相邻棋子。${theme.obstacleName}固定在格子下方。`:`Tap a piece, then its neighbor. ${theme.obstacleName[0].toUpperCase()+theme.obstacleName.slice(1)} stay beneath falling pieces.`}</span><button className="btn secondary" aria-pressed={sound} onClick={() => {const next = !sound; setSound(next); if (!setStored(soundKey, next)) setStorageWarning(true);}}>{t.game.sound} {sound ? t.game.on : t.game.off}</button></div>
    </div>;
}
