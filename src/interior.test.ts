import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {createExplorableHouse,overlapsPlayer} from './interior';
function colliders(room:ReturnType<typeof createExplorableHouse>){room.house.updateWorldMatrix(true,true);return room.solids.map(s=>new T.Box3().setFromObject(s))}
describe('walkable house',()=>{
 it('blocks closed entrance and walls but keeps living space walkable',()=>{const room=createExplorableHouse();const boxes=colliders(room);expect(overlapsPlayer(new T.Vector3(0,1.7,2.5),boxes)).toBe(true);expect(overlapsPlayer(new T.Vector3(3,1.7,0),boxes)).toBe(true);expect(overlapsPlayer(new T.Vector3(0,1.7,1.7),boxes)).toBe(false)});
 it('opens an actual passage when the door swings outward',()=>{const room=createExplorableHouse();room.door.rotation.y=-Math.PI/2;const boxes=colliders(room);expect(overlapsPlayer(new T.Vector3(0,1.7,2.5),boxes)).toBe(false);expect(overlapsPlayer(new T.Vector3(0,1.7,2.9),boxes)).toBe(false)});
 it('transforms collision bounds along with the building',()=>{const room=createExplorableHouse();room.house.position.set(-4,0,-2);expect(overlapsPlayer(new T.Vector3(-1,1.7,-2),colliders(room))).toBe(true);expect(overlapsPlayer(new T.Vector3(-4,1.7,-.3),colliders(room))).toBe(false)});
 it('has independently named indoor objects for ray selection',()=>{const room=createExplorableHouse();expect([...room.furniture.keys()]).toEqual(['window','door','sofa','table','book','lamp','switch-ceiling','switch-lamp']);for(const [id,object] of room.furniture)expect(object.userData.id).toBe(id)})
});
