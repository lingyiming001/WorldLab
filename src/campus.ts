import * as T from 'three';
export const campusLocations=[{id:'school',name:['学校','School'],x:-4,z:-17},{id:'playground',name:['操场','Playground'],x:14,z:-12},{id:'dog',name:['小狗','Dog'],x:-5,z:4},{id:'house',name:['房屋','House'],x:-4,z:-2}] as const;
function mesh(g:T.BufferGeometry,c:string,x=0,y=0,z=0){const m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
function box(w:number,h:number,d:number,c:string,x=0,y=0,z=0){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z)}
export function createPlayground(){
 const g=new T.Group(),court=new T.Group();court.userData.id='basketball-court';g.add(court);
 court.add(box(7,.09,5,'#bb8270',0,0));court.add(box(5.9,.02,3.8,'#6d9c94',0,.06));
 for(const z of [-1.9,1.9])court.add(box(5.9,.015,.045,'#f0e9d7',0,.08,z));for(const x of [-2.95,2.95,0])court.add(box(.045,.015,3.8,'#f0e9d7',x,.08));
 const ring=mesh(new T.RingGeometry(.57,.61,48),'#f0e9d7',0,.09);ring.rotation.x=-Math.PI/2;court.add(ring);
 for(const x of [-3.1,3.1]){const hoop=new T.Group();hoop.userData.id='basketball-hoop';g.add(hoop);hoop.add(box(.08,2.1,.08,'#e4e9dc',x,1.05));hoop.add(box(.08,.65,1,'#e9efdc',x,2.1));const rim=mesh(new T.TorusGeometry(.23,.025,8,24),'#eab375',x+(x<0?.3:-.3),1.8);rim.userData.id='basketball-rim';rim.rotation.x=Math.PI/2;hoop.add(rim)}return g;
}
export function createDog(){const dog=new T.Group();const body=mesh(new T.CapsuleGeometry(.3,.65,4,12),'#c89156',0,.7);body.rotation.z=Math.PI/2;dog.add(body);dog.add(mesh(new T.SphereGeometry(.31,16,12),'#deb37b',.55,1.05));dog.add(box(.3,.2,.26,'#eed8ad',.82,.97));dog.add(mesh(new T.SphereGeometry(.065,12,8),'#343d37',.99,1.02));for(const z of [-.23,.23]){dog.add(mesh(new T.SphereGeometry(.045,12,8),'#252e29',.71,1.16,z));const ear=mesh(new T.ConeGeometry(.14,.42,4),'#8f623e',.44,1.27,z);ear.rotation.z=.3;dog.add(ear);for(const x of [-.4,.4])dog.add(box(.16,.48,.16,'#c89156',x,.28,z));}dog.add(box(.12,.4,.55,'#4d8c8b',.39,.84));const tail=new T.Group();tail.name='dog-tail';tail.position.set(-.6,.83,0);const tip=mesh(new T.CapsuleGeometry(.065,.48,4,8),'#ba844c',-.18,.17);tip.rotation.z=.8;tail.add(tip);dog.add(tail);return dog}
