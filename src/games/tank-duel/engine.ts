export type Tank={x:number;y:number;dir:number;hp:number};
export type Shot={x:number;y:number;vx:number;vy:number;owner:0|1};
export type Wall=readonly [number,number,number,number];
export const arenas:readonly Wall[][]=[[[45,35,10,30]],[[25,20,8,45],[67,35,8,45]],[[42,10,16,15],[42,75,16,15]]];
export const spawnTanks=():Tank[]=>[{x:8,y:50,dir:0,hp:3},{x:87,y:50,dir:Math.PI,hp:3}];
export const circleHitsWall=(x:number,y:number,r:number,walls:readonly Wall[])=>walls.some(([wx,wy,ww,wh])=>x+r>wx&&x-r<wx+ww&&y+r>wy&&y-r<wy+wh);
export function moveTank(tank:Tank,turn:number,move:number,dt:number,walls:readonly Wall[]){
  tank.dir+=turn*2.8*dt;const steps=Math.max(1,Math.ceil(dt/.03)),step=dt/steps;
  for(let i=0;i<steps;i++){const nx=Math.max(2,Math.min(94,tank.x+Math.cos(tank.dir)*move*24*step)),ny=Math.max(4,Math.min(90,tank.y+Math.sin(tank.dir)*move*38*step));if(!circleHitsWall(nx,ny,3.2,walls)){tank.x=nx;tank.y=ny}else if(!circleHitsWall(nx,tank.y,3.2,walls))tank.x=nx;else if(!circleHitsWall(tank.x,ny,3.2,walls))tank.y=ny}
}
export function advanceShots(shots:Shot[],tanks:Tank[],walls:readonly Wall[],dt:number){
  const hits:number[]=[];
  const remaining=shots.filter(shot=>{shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;if(shot.x<=0||shot.x>=100||shot.y<=0||shot.y>=100||circleHitsWall(shot.x,shot.y,1,walls))return false;const target=tanks.findIndex((tank,i)=>i!==shot.owner&&Math.hypot(tank.x-shot.x,tank.y-shot.y)<=5);if(target<0)return true;tanks[target].hp=Math.max(0,tanks[target].hp-1);hits.push(target);return false});
  return{shots:remaining,hits};
}
export function resolveRound(wins:readonly number[],winner:0|1){const next=[...wins];next[winner]++;return{wins:next,matchWinner:next[winner]>=2?winner:null}}
