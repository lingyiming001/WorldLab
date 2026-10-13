import {describe,it,expect} from 'vitest';
import {blocked,findDogPath} from './dog-navigation';
import {readFileSync} from 'node:fs';
import {validateGlb} from './concepts';
describe('autonomous dog',()=>{
it('routes around a building without crossing its footprint',()=>{const obstacles=[{minX:-2,maxX:2,minZ:-2,maxZ:2}];const path=findDogPath({x:-5,z:0},{x:5,z:0},obstacles);expect(path.length).toBeGreaterThan(10);expect(path.every(p=>!blocked(p,obstacles))).toBe(true);expect(path.at(-1)).toEqual({x:5,z:0})});
it('rejects blocked destinations and world boundary exits',()=>{expect(findDogPath({x:0,z:0},{x:24,z:0},[])).toEqual([]);expect(findDogPath({x:5,z:0},{x:0,z:0},[{minX:-2,maxX:2,minZ:-2,maxZ:2}])).toEqual([])});
it('ships a self-contained skinned dog with real gallop and idle clips',()=>{const file=readFileSync('public/models/ShibaInu.glb');const json=validateGlb(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength) as ArrayBuffer);expect(json.skins.length).toBeGreaterThan(0);expect(json.animations.map((a:{name:string})=>a.name)).toEqual(expect.arrayContaining(['Gallop','Idle']))});
});
