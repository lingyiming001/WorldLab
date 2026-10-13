export type Point2={x:number;z:number};
export type Obstacle={minX:number;maxX:number;minZ:number;maxZ:number};
export function blocked(p:Point2,obstacles:Obstacle[],margin=.7){return Math.abs(p.x)>21||Math.abs(p.z)>22||obstacles.some(o=>p.x>o.minX-margin&&p.x<o.maxX+margin&&p.z>o.minZ-margin&&p.z<o.maxZ+margin)}
export function findDogPath(start:Point2,end:Point2,obstacles:Obstacle[]):Point2[]{
const from={x:Math.round(start.x),z:Math.round(start.z)},to={x:Math.round(end.x),z:Math.round(end.z)};if(blocked(from,obstacles)||blocked(to,obstacles))return [];
const key=(p:Point2)=>p.x+','+p.z;const frontier=[from];const parents=new Map<string,Point2|null>([[key(from),null]]);let found=false;
for(let i=0;i<frontier.length&&i<2500;i++){const p=frontier[i];if(key(p)===key(to)){found=true;break}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const next={x:p.x+dx,z:p.z+dz};if(!parents.has(key(next))&&!blocked(next,obstacles)){parents.set(key(next),p);frontier.push(next)}}}
if(!found)return [];const path:Point2[]=[];let p:Point2|null=to;while(p&&key(p)!==key(from)){path.push(p);p=parents.get(key(p))??null}return path.reverse();
}
