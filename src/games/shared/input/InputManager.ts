export type InputSnapshot={pressed:ReadonlySet<string>;justPressed:ReadonlySet<string>};
const blocked=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Spacebar']);
export class InputManager{private pressed=new Set<string>();private fresh=new Set<string>();private paused=false;private listeners=new Set<(paused:boolean)=>void>();
  private down=(event:KeyboardEvent)=>{if(blocked.has(event.key)||blocked.has(event.code))event.preventDefault();const key=event.key.length===1?event.key.toLowerCase():event.key;if(!this.pressed.has(key))this.fresh.add(key);this.pressed.add(key);if(key==='p'||key==='Escape')this.setPaused(!this.paused)};
  private up=(event:KeyboardEvent)=>{this.pressed.delete(event.key.length===1?event.key.toLowerCase():event.key)};
  private blur=()=>this.setPaused(true);
  mount(){addEventListener('keydown',this.down,{passive:false});addEventListener('keyup',this.up);addEventListener('blur',this.blur);return()=>this.destroy()}
  destroy(){removeEventListener('keydown',this.down);removeEventListener('keyup',this.up);removeEventListener('blur',this.blur);this.pressed.clear();this.fresh.clear()}
  snapshot():InputSnapshot{const snap={pressed:new Set(this.pressed),justPressed:new Set(this.fresh)};this.fresh.clear();return snap}
  isDown(...keys:string[]){return keys.some(key=>this.pressed.has(key))}consume(key:string){const hit=this.fresh.has(key);this.fresh.delete(key);return hit}
  setPaused(value:boolean){this.paused=value;this.pressed.clear();this.fresh.clear();this.listeners.forEach(listener=>listener(value))}isPaused(){return this.paused}onPause(listener:(paused:boolean)=>void){this.listeners.add(listener);return()=>this.listeners.delete(listener)}
}
export const playerKeys={one:{up:'w',down:'s',left:'a',right:'d',light:'f',heavy:'g'},two:{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',light:'k',heavy:'l'}}as const;
