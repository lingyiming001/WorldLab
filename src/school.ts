import * as T from 'three';
export const SCHOOL_FLOOR_HEIGHT=3.2;
export type SchoolState={inside:boolean;nearEntrance:boolean;floor:number};
export function createExplorableSchool(){
 const house=new T.Group(),solids:T.Object3D[]=[],surfaces:T.Object3D[]=[];
 function box(w:number,h:number,d:number,color:string,x=0,y=0,z=0){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;house.add(m);return m}
 function wall(w:number,h:number,d:number,x:number,y:number,z:number,color='#d8cbb6'){const m=box(w,h,d,color,x,y,z);solids.push(m);return m}
 function floor(w:number,d:number,x:number,z:number,top:number){const m=box(w,.14,d,'#b9bcb0',x,top-.07,z);surfaces.push(m);return m}
 function sign(text:string,x:number,y:number,z:number,w=2.5){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#365b67';ctx.fillRect(0,0,768,128);ctx.fillStyle='#fff8e7';ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,84);const m=new T.Mesh(new T.PlaneGeometry(w,w/6),new T.MeshStandardMaterial({map:new T.CanvasTexture(canvas)}));m.position.set(x,y,z);house.add(m)}
 // A hollow three-storey block. The front doorway stays physically open.
 wall(.24,9.6,6,-12.5,4.8,0);wall(.24,9.6,6,12.5,4.8,0);wall(25,9.6,.24,0,4.8,-3);
 for(const x of [-6.95,6.95])wall(11.1,9.6,.24,x,4.8,3);
 wall(2.8,.6,.24,0,2.9,3);wall(2.8,.6,.24,0,6.1,3);wall(2.8,.6,.24,0,9.3,3);box(25.6,.25,6.6,'#9da9a7',0,9.72);
 for(const x of [-11,11]){wall(4,6.4,12,x,3.2,9);box(4.5,.25,12.5,'#9da9a7',x,6.55,9)}
 const glass=new T.MeshPhysicalMaterial({color:'#6d9aaa',transparent:true,opacity:.48,roughness:.18,side:T.DoubleSide});
 for(const y of [4.5,7.7]){const pane=wall(2.8,2.6,.08,0,y,3);pane.material=glass;box(.08,2.6,.12,'#e1e7df',0,y,3.07)}
 for(let level=0;level<3;level++){
  const y=level*SCHOOL_FLOOR_HEIGHT;
  if(level===0)floor(25,6,0,0,0);else{
   floor(11.2,6,-6.9,0,y);floor(11.2,6,6.9,0,y);
   floor(2.6,.8,0,-2.6,y);floor(2.6,.8,0,2.6,y);
  }
  box(25.2,.12,.2,'#eeeee7',0,y+.12,3.16);
  for(const x of [-11,-8.8,-6.6,-4.4,4.4,6.6,8.8,11]){
   const pane=box(1.55,1.65,.07,'#638797',x,y+1.7,3.16);pane.material=glass;
   for(const dx of [-.83,.83])box(.065,1.8,.13,'#e1e7df',x+dx,y+1.7,3.2);
   for(const dy of [-.9,.9])box(1.72,.065,.13,'#e1e7df',x,y+1.7+dy,3.2);
  }
  // Two classrooms on each level, with real door gaps off the central hall.
  for(const x of [-3.6,3.6]){
   wall(.14,2.9,2.3,x,y+1.55,-1.85,'#ede4cc');
   wall(.14,2.9,.9,x,y+1.55,2.55,'#ede4cc');
   wall(.14,.55,2.8,x,y+2.825,.6,'#ede4cc');
  }
  for(const side of [-1,1]){
   const x=side*8;
   wall(4,.95,.13,x,y+1.5,-2.8,'#365b53');
   for(const dx of [-1.3,1.3])for(const z of [-.9,1.4]){
    const desk=wall(1,.08,.65,x+dx,y+.78,z,'#b39162');
    desk.userData.schoolFurniture=true;
    for(const leg of [-.38,.38])box(.06,.75,.06,'#68736b',x+dx+leg,y+.375,z);
    wall(.55,.48,.55,x+dx,y+.24,z+.68,'#7b9691');
   }
  }
  sign(`${level+1}F · ${level===0?'教室 / CLASSROOM':'走廊 / CORRIDOR'}`,2.6,y+2.25,2.78,2);
  const light=new T.PointLight('#fff3d9',10,10,2);light.position.set(0,y+2.6,0);house.add(light);
  for(const x of [-7,0,7])box(.6,.05,.4,'#f4f1dc',x,y+3.02,0);
  if(level<2){
   for(let i=0;i<16;i++){
    const top=y+(i+1)*.2,z=2.2-(i+.5)*.275;
    const step=box(2.4,.2,.275,'#a8b7b3',0,top-.1,z);surfaces.push(step);
    box(2.4,.014,.045,'#e9dba7',0,top+.008,z+.105);
   }
   // Rails bound the flights and the open edge of the upper landings.
   for(const x of [-1.38,1.38]){
    const rail=wall(.07,.07,5.44,x,y+2.65,0,'#537881');rail.rotation.x=Math.atan2(3.2,4.4);
    for(let i=0;i<8;i++)wall(.055,.95,.055,x,y+.2+i*.4+.475,2.05-i*.55,'#537881');
   }
   sign('楼梯 · STAIRS',0,y+2.65,2.72,2.3);
  }
  if(level>0){for(const x of [-1.38,1.38])wall(.06,1.05,4.4,x,y+.525,0,'#537881')}
 }
 floor(6,3,0,4.5,0);box(6.3,.24,2.5,'#7a8b88',0,3.05,4.15);
 for(const x of [-2.8,2.8])wall(.16,3,.16,x,1.5,5.2);
 box(18,.04,9,'#d2cbb8',0,-.035,10.5);
 for(const x of [-7,7]){wall(2.8,.5,1.4,x,.25,10);box(2.4,.25,1,'#6b935d',x,.65,10)}
 sign('世界学校 · WORLD SCHOOL',0,9.05,3.3,7);
 for(const x of [-6.5,6.5]){box(.07,7.5,.07,'#859391',x,3.75,13);box(1.4,.8,.04,x<0?'#d7755f':'#69896e',x+.65,7,13)}
 house.updateWorldMatrix(true,true);
 return {house,solids,surfaces};
}
