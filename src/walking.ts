import * as T from 'three';
export const EYE_HEIGHT=1.7;
/** Only blocks obstacles that intersect the standing body at its current floor. */
export function overlapsStanding(position:T.Vector3,boxes:T.Box3[],radius=.23){const foot=position.y-EYE_HEIGHT;return boxes.some(b=>b.max.y>foot+.12&&b.min.y<position.y+.15&&position.x>b.min.x-radius&&position.x<b.max.x+radius&&position.z>b.min.z-radius&&position.z<b.max.z+radius)}
/** Climb one tread, descend one tread, or remain on a floor; reject unsupported ledges. */
export function supportHeight(position:T.Vector3,surfaces:T.Box3[],foot:number):number|null{
 const heights=surfaces.filter(b=>position.x>=b.min.x-.015&&position.x<=b.max.x+.015&&position.z>=b.min.z-.015&&position.z<=b.max.z+.015).map(b=>b.max.y).filter(h=>h<=foot+.26&&h>=foot-.35);
 if(foot<=.35)heights.push(0);
 return heights.length?Math.max(...heights):null;
}
export function moveStanding(position:T.Vector3,delta:T.Vector3,boxes:T.Box3[],surfaces:T.Box3[]){
 const result=position.clone();
 // Small substeps keep sprinting from skipping a tread or tunnelling through a wall.
 const count=Math.max(1,Math.ceil(Math.max(Math.abs(delta.x),Math.abs(delta.z))/.1));
 for(let i=0;i<count;i++)for(const axis of ['x','z'] as const){
  if(!delta[axis])continue;
  const candidate=result.clone();candidate[axis]+=delta[axis]/count;
  const floor=supportHeight(candidate,surfaces,result.y-EYE_HEIGHT);if(floor===null)continue;
  candidate.y=floor+EYE_HEIGHT;
  const lowCeiling=surfaces.some(b=>b.min.y>floor+.26&&b.min.y<candidate.y+.15&&candidate.x>b.min.x&&candidate.x<b.max.x&&candidate.z>b.min.z&&candidate.z<b.max.z);
  if(!lowCeiling&&!overlapsStanding(candidate,boxes))result.copy(candidate);
 }
 return result;
}
