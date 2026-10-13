import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {createExplorableSchool} from './school';
import {moveStanding,overlapsStanding,EYE_HEIGHT} from './walking';
function fixture(){const s=createExplorableSchool();s.house.updateWorldMatrix(true,true);return {s,boxes:s.solids.map(o=>new T.Box3().setFromObject(o)),surfaces:s.surfaces.map(o=>new T.Box3().setFromObject(o))}}
// Canvas labels are visual; minimal canvas adapter lets geometry tests run in Node.
import {vi,beforeAll,afterAll} from 'vitest';
beforeAll(()=>vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){},fillStyle:'',font:'',textAlign:''})})}));afterAll(()=>vi.unstubAllGlobals());
describe('walkable three-storey school',()=>{
 it('blocks outer walls on every floor but admits the ground entrance',()=>{const {boxes}=fixture();for(const foot of [0,3.2,6.4]){expect(overlapsStanding(new T.Vector3(12.5,foot+EYE_HEIGHT,0),boxes)).toBe(true);expect(overlapsStanding(new T.Vector3(0,foot+EYE_HEIGHT,-3),boxes)).toBe(true)}expect(overlapsStanding(new T.Vector3(0,EYE_HEIGHT,3),boxes)).toBe(false);expect(overlapsStanding(new T.Vector3(0,4.9,3),boxes)).toBe(true)});
 it('walks up every tread to the second and third floors, then down again',()=>{const {boxes,surfaces}=fixture();let p=new T.Vector3(0,EYE_HEIGHT,2.55);for(let floor=0;floor<2;floor++){for(let i=0;i<120;i++)p=moveStanding(p,new T.Vector3(0,0,-.045),boxes,surfaces);expect(p.y).toBeCloseTo(EYE_HEIGHT+(floor+1)*3.2);expect(p.z).toBeLessThan(-2.3);if(floor===0)p.set(0,p.y,2.55)}for(let i=0;i<120;i++)p=moveStanding(p,new T.Vector3(0,0,.045),boxes,surfaces);expect(p.y).toBeCloseTo(EYE_HEIGHT+3.2);expect(p.z).toBeGreaterThan(2.3)});
 it('climbs with sprint-size movement without skipping treads',()=>{const {boxes,surfaces}=fixture();let p=new T.Vector3(0,EYE_HEIGHT,2.55);for(let i=0;i<20;i++)p=moveStanding(p,new T.Vector3(0,0,-.28),boxes,surfaces);expect(p.y).toBeCloseTo(4.9)});
 it('slides along a wall without crossing it at sprint speed',()=>{const {boxes,surfaces}=fixture();let p=new T.Vector3(11,EYE_HEIGHT,0);for(let i=0;i<100;i++)p=moveStanding(p,new T.Vector3(.28,0,0),boxes,surfaces);expect(p.x).toBeLessThan(12.2);expect(p.x).toBeGreaterThan(11)});
 it('prevents leaving an upper floor through the stairwell edge',()=>{const {boxes,surfaces}=fixture();const p=new T.Vector3(2,4.9,0);const next=moveStanding(p,new T.Vector3(-1,0,0),boxes,surfaces);expect(next.x).toBeGreaterThan(1.55);expect(next.y).toBeCloseTo(p.y)});
 it('blocks walking into the low underside of the staircase',()=>{const {boxes,surfaces}=fixture();const p=new T.Vector3(2,EYE_HEIGHT,0);const next=moveStanding(p,new T.Vector3(-2,0,0),boxes,surfaces);expect(next.x).toBeGreaterThan(1.2)});
 it('updates support and blockers after a building translation',()=>{const {s}=fixture();s.house.position.set(-4,0,-17);s.house.updateWorldMatrix(true,true);const boxes=s.solids.map(o=>new T.Box3().setFromObject(o));const surfaces=s.surfaces.map(o=>new T.Box3().setFromObject(o));expect(overlapsStanding(new T.Vector3(8.5,4.9,-17),boxes)).toBe(true);const p=moveStanding(new T.Vector3(-4,4.9,-14.4),new T.Vector3(0,0,-.5),boxes,surfaces);expect(p.y).toBeGreaterThan(4.9)});
});
