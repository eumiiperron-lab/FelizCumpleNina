import * as THREE from './vendor/three.module.js';
const smooth=(a,b,t)=>{const u=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return u*u*(3-2*u);};
export function nightEndingTimeline(time){return {lookUp:smooth(1.8,3.4,time),eyes:smooth(3.7,6.3,time),complete:time>=7.4};}
export function createMemoryThree(){
 const street=new THREE.Scene();street.name='Recuerdo 03 · De la mano';street.background=new THREE.Color('#172034');street.fog=new THREE.Fog('#172034',18,65);
 const bedroom=new THREE.Scene();bedroom.name='Recuerdo 03 · La primera noche';bedroom.background=new THREE.Color('#151622');
 street.add(new THREE.HemisphereLight('#8399c7','#2a2635',1.3));bedroom.add(new THREE.HemisphereLight('#8a9ab2','#4a3735',.75));
 const mat=color=>new THREE.MeshLambertMaterial({color,flatShading:true});const dark=mat('#252936'),white=mat('#ece7dc');
 function box(scene,w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'?mat(color):color);m.position.set(x,y,z);scene.add(m);return m;}
 box(street,9,.16,90,'#252b38',-2.5,-.1,-22);box(street,3,.22,90,'#777d85',3.5,0,-22);box(street,3,.22,90,'#656c76',-8.5,0,-22);
 for(let i=0;i<17;i++)box(street,.1,.015,1.7,'#c4bc9f',-2.5,.0,12-i*5);
 for(const side of [-1,1])for(let i=0;i<9;i++){
  const x=side===1?7.7:-12,z=10-i*7,h=4+(i%3)*1.3;box(street,4.5,h,6,['#414857','#555568','#484b55'][i%3],x,h/2,z);
  for(let j=0;j<2;j++)for(let k=0;k<2;k++)box(street,.025,.65,.75,new THREE.MeshBasicMaterial({color:(i+j+k)%3===0?'#d5b888':'#616e88'}),x+(side===1?-2.26:2.26),1.2+j*1.6,z-1.3+k*2.2);
 }
 for(let i=0;i<6;i++){const z=10-i*10;box(street,.1,4.4,.1,dark,4.75,2.2,z);box(street,.65,.08,.35,new THREE.MeshBasicMaterial({color:'#e7c794'}),4.45,4.35,z);const light=new THREE.PointLight('#ffd3a0',12,12,1.3);light.position.set(4.4,4.15,z);street.add(light);}
 const moon=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({color:'#cdd7e2'}));moon.position.set(-13,19,-42);street.add(moon);
 // Curbs and pavement joints give the walk scale without adding pedestrians.
 box(street,.14,.30,90,'#b1b0aa',1.93,.02,-22);
 const joints=[];for(let z=14;z>-65;z-=1.25)joints.push(2,.116,z,4.94,.116,z);for(const x of [3,4])joints.push(x,.116,14,x,.116,-65);
 street.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(joints,3)),new THREE.LineBasicMaterial({color:'#5c646f'})));
 for(let i=0;i<7;i++)box(street,.48,.018,2.3,'#b9b6a8',-6+i*1.05,.006,-1.5);
 // Entrances, low-poly trees, benches and small street fixtures.
 for(let i=0;i<7;i++){
  const z=8-i*8;box(street,.08,2.1,.95,'#292e3d',5.43,1.06,z);box(street,.12,.12,1.05,'#8a8d95',5.36,2.14,z);
  box(street,.05,.1,.1,'#bdab87',5.36,1.05,z+.33);
  box(street,.95,.12,1.85,'#725f61',5.05,2.5,z);
  box(street,.65,.54,.65,'#5d6265',4.4,.38,z-3.2);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,1.15,6),mat('#5e514b'));trunk.position.set(4.4,1.05,z-3.2);street.add(trunk);
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.65,0),mat(i%2?'#53665d':'#465e5b'));crown.scale.set(.8,1.15,.8);crown.position.set(4.4,1.85,z-3.2);street.add(crown);
  if(i%2===0){box(street,.65,.12,1.55,'#73665d',4.45,.56,z+.95);box(street,.08,.5,1.55,'#73665d',4.75,.83,z+.95);for(const dz of [-.5,.5])box(street,.42,.5,.1,'#303743',4.45,.25,z+.95+dz);}
  const drain=box(street,.33,.018,.65,'#3e4751',2.2,.122,z-1.8);drain.name='curb drain';
 }
 for(let i=0;i<9;i++){const z=10-i*7;box(street,.16,.16,5.9,'#686978',5.38,3.6,z);box(street,.15,.08,5.9,'#2f3445',5.32,.23,z);}
 const stars=[];for(let i=0;i<70;i++){const a=i*2.399;stars.push(Math.cos(a)*30,12+(i%9)*2,Math.sin(a)*32-20);}const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));street.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:'#bac5d7',size:.055,transparent:true,opacity:.65})));
 const standingNina=new THREE.Group();standingNina.name='Nina standing at window';standingNina.position.set(-3.05,0,-.85);bedroom.add(standingNina);
 const walkingNina=new THREE.Group();walkingNina.name='Nina walking';street.add(walkingNina);
 const hands=new THREE.Group();hands.name='holding hands';street.add(hands);
 function segment(name,start,end,radius,color){const dir=end.clone().sub(start),m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,dir.length(),6),mat(color));m.name=name;m.position.copy(start.clone().add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());hands.add(m);return m;}
 segment('player sleeve',new THREE.Vector3(.2,1.13,.24),new THREE.Vector3(-.23,1.02,.03),.07,'#35414a');segment('Nina sleeve',new THREE.Vector3(-.95,1.12,0),new THREE.Vector3(-.50,.98,.03),.065,'#efebe4');
 for(const [x,z] of [[-.34,.02],[-.42,.05]]){const hand=new THREE.Mesh(new THREE.IcosahedronGeometry(.10,1),white);hand.position.set(x,.99,z);hand.scale.set(1,.7,1);hands.add(hand);}
 const streetSpawn=new THREE.Vector3(3.5,1.65,10);
 // A low, wide bed with separate pillows, exposed mattress and a quilt at the feet.
 box(bedroom,8,.2,9,'#4f4b4b',0,-.1,0);box(bedroom,8,3,.15,'#585260',0,1.5,-3.9);box(bedroom,.15,3,9,'#494958',-4,1.5,0);box(bedroom,.15,3,9,'#494958',4,1.5,0);box(bedroom,8,.12,9,'#827c7d',0,3,0);
 box(bedroom,3.4,.42,4,'#514952',0,.25,.1);const mattress=box(bedroom,3.25,.28,3.8,'#e0ddd5',0,.64,.1);mattress.name='mattress';const mattressTop=.78;
 box(bedroom,3.5,1.12,.18,'#5c4d51',0,.70,-1.9);
 const ninaPillow=box(bedroom,.65,.14,.7,'#f0eee8',1,.85,-1.18);ninaPillow.name='Nina pillow';box(bedroom,.85,.14,.7,'#eee9e1',-.68,.85,-1.18);
 // One continuous draped 3D sheet covers both bodies and falls over the bed edges.
 const sheetPositions=[],sheetIndices=[],nx=32,nz=28;
 for(let iz=0;iz<=nz;iz++)for(let ix=0;ix<=nx;ix++){
  const x=-1.8+3.6*ix/nx,z=-.42+2.62*iz/nz,t=iz/nz;
  const bodies=.57*Math.exp(-Math.pow((x-.62)/.5,2))+.44*Math.exp(-Math.pow((x+.68)/.5,2));
  let y=.88+bodies*(1-.58*t)+.025*Math.sin(x*14+z*3)*Math.sin(Math.PI*t);
  y-=.4*smooth(1.50,1.8,Math.abs(x));y-=.35*smooth(1.95,2.2,z);
  sheetPositions.push(x,y,z);
 }
 for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){const a=iz*(nx+1)+ix,b=a+1,c=a+nx+1,d=c+1;sheetIndices.push(a,c,b,b,c,d);}
 const sheetGeometry=new THREE.BufferGeometry();sheetGeometry.setAttribute('position',new THREE.Float32BufferAttribute(sheetPositions,3));sheetGeometry.setIndex(sheetIndices);sheetGeometry.computeVertexNormals();
 const sheet=new THREE.Mesh(sheetGeometry,new THREE.MeshLambertMaterial({color:'#9aa9b2',flatShading:true,side:THREE.DoubleSide}));sheet.name='shared draped sheet';bedroom.add(sheet);
 box(bedroom,.7,.7,.65,'#5d4d4b',2.35,.35,-1.25);box(bedroom,.11,.38,.11,'#b19a80',2.35,.9,-1.25);
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(.22,.35,.32,8),mat('#d7bd94'));shade.position.set(2.35,1.2,-1.25);bedroom.add(shade);const lamp=new THREE.PointLight('#ffd5a0',7,9,1.4);lamp.position.set(2.2,1.4,-1.25);bedroom.add(lamp);
 box(bedroom,.04,1.55,1.95,'#263b59',-3.9,1.8,-.4);
 for(const z of [-1.42,.62])box(bedroom,.10,1.65,.07,'#b7b1ab',-3.85,1.8,z);
 for(const y of [.98,2.62])box(bedroom,.10,.07,2.1,'#b7b1ab',-3.85,y,-.4);
 box(bedroom,.11,1.64,.06,'#b7b1ab',-3.83,1.8,-.4);
 // Soft room details: curtains, a rug, a shelf and a bedside clock.
 box(bedroom,2.4,.025,1.5,'#686370',.1,.02,2.7);
 for(const z of [-1.58,.8]){box(bedroom,.13,2.05,.34,'#8c7f83',-3.69,1.54,z);for(let i=0;i<3;i++)box(bedroom,.03,2.05,.035,'#766b73',-3.60,1.54,z-.10+i*.10);}
 box(bedroom,.15,.08,2.5,'#a59a8e',-3.61,2.66,-.4);
 box(bedroom,1.8,.10,.4,'#66595a',1.6,1.9,-3.7);for(let i=0;i<6;i++)box(bedroom,.13,.30+(i%3)*.07,.20,['#8e9392','#a28b78','#736f88'][i%3],.95+i*.2,2.12,-3.68);
 box(bedroom,.30,.20,.10,'#292b35',2.35,.83,-.96);box(bedroom,.24,.12,.014,'#9fadae',2.35,.84,-.90);
 const bedroomSpawn=new THREE.Vector3(-.68,1.36,-1.15),bedTalkTarget=new THREE.Vector3(.28,1.27,-.58),ceilingTarget=new THREE.Vector3(-.68,3,-1.12);
 const ninaBedHead=new THREE.Vector3(.62,1.30,-.88);
 const windowSpawn=new THREE.Vector3(-2.4,1.65,.35),windowTarget=new THREE.Vector3(-3.05,1.40,-.85);
 let recliningNina=null,walkTime=0;
 const loader=new THREE.TextureLoader();const pixel=t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;};
 const ready=Promise.all([loader.loadAsync('./assets/nina-recuerdo-2.png').then(t=>{pixel(t);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));sprite.scale.set(1.7*t.image.width/t.image.height,1.7,1);sprite.position.set(0,.96,0);walkingNina.add(sprite);const windowSprite=sprite.clone();windowSprite.name='Nina at window';standingNina.add(windowSprite);}),loader.loadAsync('./assets/nina-dormida.png').then(t=>{pixel(t);const width=2.21,height=width*t.image.height/t.image.width;recliningNina=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshLambertMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false}));recliningNina.name='Nina reclining above mattress';recliningNina.rotation.y=-Math.PI/2;recliningNina.position.set(.62,mattressTop+.035+height/2,-.225);bedroom.add(recliningNina);})]);ready.catch(()=>{});
 function enterWindow(){standingNina.visible=true;sheet.visible=false;if(recliningNina)recliningNina.visible=false;}
 function enterBed(){standingNina.visible=false;sheet.visible=true;if(recliningNina)recliningNina.visible=true;}
 function reset(){walkTime=0;positionWalk(streetSpawn);enterWindow();}
 function positionWalk(position){walkingNina.position.set(position.x-1.02,Math.sin(walkTime*5)*.018,position.z-.18);hands.position.set(position.x,Math.sin(walkTime*5)*.012,position.z-.1);}
 return {street,bedroom,ready,streetSpawn,bedroomSpawn,bedTalkTarget,ceilingTarget,mattressTop,windowSpawn,windowTarget,ninaBedHead,enterWindow,enterBed,reset,updateStreet(dt,camera,walking){if(walking){walkTime+=dt;camera.position.set(streetSpawn.x,streetSpawn.y+Math.sin(walkTime*5)*.018,streetSpawn.z-Math.min(walkTime*.8,5.6));positionWalk(camera.position);}return walkTime>=7;},streetTalkTarget(){return walkingNina.position.clone().add(new THREE.Vector3(0,1.4,0));},get walkTime(){return walkTime;},get recliningNina(){return recliningNina;}};
}
