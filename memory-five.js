import * as THREE from './vendor/three.module.js';
const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
export function fiveTimeline(t){return {reveal:ease(t/8),travel:ease((t-4)/48),fade:ease((t-52)/3),complete:t>=56};}
export function lightRhythm(t){const beat=Math.max(0,t)*68/60,phase=beat%1;return {pulse:Math.exp(-phase*5),hue:((Math.floor(beat/4)*.17+.96)%1)};}
export function createMemoryFive(){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#000000');scene.fog=new THREE.FogExp2('#000000',.022);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshStandardMaterial({color:'#080909',roughness:.28,metalness:.5}));ground.rotation.x=-Math.PI/2;scene.add(ground);
 const ambient=new THREE.HemisphereLight('#6c2032','#080709',0);scene.add(ambient);
 const exhibit=new THREE.Group();scene.add(exhibit);exhibit.visible=false;
 const slits=[];
 const dark=new THREE.MeshStandardMaterial({color:'#110d12',roughness:.75});
 for(const side of [-1,1])for(let i=0;i<14;i++){
  const p=new THREE.Mesh(new THREE.BoxGeometry(2.5,17+(i%3)*3,2.5),dark);p.position.set(side*(9+(i%2)*2),p.geometry.parameters.height/2,-i*5);exhibit.add(p);
  const slit=new THREE.Mesh(new THREE.BoxGeometry(.04,13,.08),new THREE.MeshBasicMaterial({color:'#d94349'}));slit.position.set(side*7.7,6.5,-i*5);exhibit.add(slit);slits.push(slit);
 }
 const glow=new THREE.PointLight('#f32748',0,100,1.2);glow.position.set(0,9,-35);scene.add(glow);
 const portal=new THREE.Group();portal.position.set(0,10,-59);exhibit.add(portal);
 for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(8+i*.42,.025,5,120),new THREE.MeshBasicMaterial({color:i%2?'#dc7280':'#ff263f',transparent:true,opacity:.65}));portal.add(ring);ring.rotation.z=i*.2;}
 const positions=new Float32Array(4200),base=new Float32Array(4200);for(let i=0;i<positions.length;i+=3){const a=Math.random()*Math.PI*2,r=3+Math.random()*17;base[i]=Math.cos(a)*r;base[i+1]=1+Math.random()*24;base[i+2]=-8-Math.random()*76;}positions.set(base);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const dust=new THREE.Points(geo,new THREE.PointsMaterial({color:'#e27d88',size:.065,transparent:true,opacity:.6,depthWrite:false}));exhibit.add(dust);
 const phoneLight=new THREE.PointLight('#d4ecff',1.2,5);phoneLight.position.set(0,1.3,-.5);scene.add(phoneLight);
 const birthday=new THREE.Group();birthday.name='Birthday finale';birthday.visible=false;scene.add(birthday);
 const wood=new THREE.MeshStandardMaterial({color:'#75513d',roughness:.8});
 function part(geometry,material,x,y,z,name){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);if(name)m.name=name;birthday.add(m);return m;}
 part(new THREE.CylinderGeometry(1.25,1.25,.13,32),wood,0,.93,-3,'Birthday table');
 for(const x of [-.7,.7])for(const z of [-3.7,-2.3])part(new THREE.BoxGeometry(.09,.9,.09),wood,x,.45,z);
 part(new THREE.CylinderGeometry(.49,.49,.035,32),new THREE.MeshStandardMaterial({color:'#efe3cb'}),0,1.02,-3);
 part(new THREE.CylinderGeometry(.4,.42,.3,24),new THREE.MeshStandardMaterial({color:'#f3cfca',roughness:.9}),0,1.18,-3,'Birthday cake');
 part(new THREE.CylinderGeometry(.415,.415,.055,24),new THREE.MeshStandardMaterial({color:'#fff0dd'}),0,1.35,-3);
 const flames=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2,x=Math.cos(a)*.24,z=-3+Math.sin(a)*.24;part(new THREE.CylinderGeometry(.016,.016,.22,6),new THREE.MeshStandardMaterial({color:i%2?'#dca1c8':'#a3cace'}),x,1.49,z);const f=part(new THREE.SphereGeometry(.035,6,6),new THREE.MeshBasicMaterial({color:'#ffcf70'}),x,1.63,z);f.scale.y=1.8;flames.push(f);}
 const warm=new THREE.PointLight('#ffd6a5',0,14,1.4);warm.position.set(0,3,-1);scene.add(warm);
 const candleLight=new THREE.PointLight('#ffb851',0,4,1.2);candleLight.position.set(0,1.8,-3);scene.add(candleLight);
 const ninaReady=new THREE.TextureLoader().loadAsync('./assets/nina-recuerdo-2.png').then(texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;const nina=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));nina.name='Nina sprite 1';nina.scale.set(2.4*texture.image.width/texture.image.height,2.4,1);nina.position.set(0,1.2,-4.1);birthday.add(nina);});
 const dogs=[];
 const dogReady=Promise.all([new THREE.TextureLoader().loadAsync('./assets/nina-dogs-atlas.png'),new THREE.TextureLoader().loadAsync('./assets/nina-dog-five.png')]).then(([sheet,replacement])=>{sheet.colorSpace=THREE.SRGBColorSpace;replacement.colorSpace=THREE.SRGBColorSpace;const spots=[[-2.05,-5.3],[-1.1,-5.5],[.15,-5.9],[1.25,-5.5],[2.2,-5.2]],regions=[[0,.18],[.18,.444],[.444,.635],[.635,.825],[.825,1]];for(let i=0;i<5;i++){const texture=i===4?replacement:sheet.clone();const [left,right]=regions[i];if(i!==4){texture.repeat.set(right-left,1);texture.offset.set(left,0);}texture.needsUpdate=true;const dog=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:true,alphaTest:.04}));dog.name='Nina dog '+(i+1);dog.center.set(.5,0);const height=i===0?1.2:i===1||i===2?1:1.05;dog.scale.set(height*(i===4?replacement.image.width/replacement.image.height:(sheet.image.width*(right-left))/sheet.image.height),height,1);dog.position.set(spots[i][0],.03,spots[i][1]);birthday.add(dog);dogs.push({sprite:dog,x:spots[i][0],z:spots[i][1],phase:i*1.37});}});
 const ready=Promise.all([ninaReady,dogReady]);ready.catch(()=>{});

 function phoneView(camera,t){camera.position.set(0,1.65,4);const target=new THREE.PerspectiveCamera();target.position.copy(camera.position);target.lookAt(.55,.9,2.5);camera.quaternion.slerpQuaternions(new THREE.Quaternion(),target.quaternion,ease(t/1.8));}
 function centerView(camera,t,from){camera.position.set(0,1.65,4);camera.quaternion.slerpQuaternions(from,new THREE.Quaternion(),ease(t/2));phoneLight.intensity=1.2*(1-ease(t/1.2));}
 function showBirthday(camera){exhibit.visible=false;birthday.visible=true;glow.intensity=0;ambient.color.set('#b68c72');ambient.intensity=.8;warm.intensity=18;candleLight.intensity=2;phoneLight.intensity=0;camera.position.set(0,1.7,1.8);camera.lookAt(0,1.3,-4);}
 function updateBirthday(t){for(const dog of dogs){const phase=t*2.4+dog.phase,jump=Math.max(0,Math.sin(phase));dog.sprite.position.set(dog.x+Math.sin(t*.85+dog.phase)*.14,.03+jump*jump*.55,dog.z+Math.sin(t*.6+dog.phase)*.08);dog.sprite.material.rotation=Math.sin(phase)*.065;}candleLight.intensity=2+Math.sin(t*7)*.12;flames.forEach((f,i)=>f.scale.y=1.8+Math.sin(t*5+i)*.15);}
 function reset(camera){portal.visible=true;birthday.visible=false;warm.intensity=0;candleLight.intensity=0;exhibit.visible=false;ambient.intensity=0;glow.intensity=0;phoneLight.intensity=1.2;camera.position.set(0,1.65,4);camera.lookAt(0,1.65,-20);}
 function update(t,camera){const state=fiveTimeline(t),rhythm=lightRhythm(t);exhibit.visible=true;phoneLight.intensity=0;
 const color=new THREE.Color().setHSL(rhythm.hue,.75,.57);ambient.color.copy(color);ambient.intensity=state.reveal*(.48+rhythm.pulse*.25);glow.color.copy(color);glow.intensity=state.reveal*(95+rhythm.pulse*65);
 slits.forEach((slit,i)=>{slit.material.color.setHSL((rhythm.hue+(i%4)*.025)%1,.8,.42+rhythm.pulse*.18);});
 portal.children.forEach((ring,i)=>{ring.material.color.setHSL((rhythm.hue+i*.05)%1,.8,.58);ring.material.opacity=.48+rhythm.pulse*.3;});dust.material.color.copy(color);
 camera.position.set(Math.sin(state.travel*Math.PI)*1.3,1.65+state.travel*8.35,4-state.travel*85);
 // Always look forward: crossing the ring must not turn the camera back at it.
 camera.lookAt(0,1.65+(5.35+state.travel*3)*state.reveal,camera.position.z-63);portal.visible=camera.position.z>-60;portal.rotation.z=t*.018;dust.rotation.z=Math.sin(t*.08)*.035;return state;}

 return {scene,ready,phoneView,centerView,showBirthday,updateBirthday,reset,update};
}
