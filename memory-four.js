import * as THREE from './vendor/three.module.js';
import {createIncaBottle,loadBottleLabel} from './inca-bottle.js';
// First-person seated prototype: an empty theater, with Nina in the adjacent central seat.
const smooth=(a,b,t)=>{const x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
export function cinemaClosingTimeline(time){return {ninaTurn:smooth(0,1.2,time),cameraTurn:smooth(1.4,2.8,time),darkness:smooth(3,4.6,time),fade:time>=4.8,complete:time>=5.8};}
export function createMemoryFour(){
 const scene=new THREE.Scene();scene.name='Recuerdo 04 · Compartir el tiempo y gustos juntos';scene.background=new THREE.Color('#080b14');scene.fog=new THREE.Fog('#080b14',24,48);
 scene.add(new THREE.HemisphereLight('#7b96c1','#17101a',.65));
 const material=color=>new THREE.MeshLambertMaterial({color,flatShading:true});
 const wall=material('#161c2a'),floor=material('#14131c'),metal=material('#161b25'),fabric=material('#642b43'),cushion=material('#77384b');
 function box(w,h,d,m,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
 box(20,.18,30,floor,0,-.14,0);box(.35,10,30,wall,-10,4.9,0);box(.35,10,30,wall,10,4.9,0);box(20,10,.3,wall,0,4.9,14);box(20,1,30,material('#0b0e18'),0,10.2,0);box(20,10,.3,wall,0,4.9,-14);
 // Wall panels, subtle aisle lighting and stepped rows.
 const panelMat=material('#202435');for(const side of [-1,1])for(let i=0;i<7;i++)box(.12,5,2.2,panelMat,side*9.78,4.5,-10+i*3.6);
 const rowCount=8,columnCount=12,spacing=1.23,rowGap=2.5;
 const aisleLights=[];const chairs=[];for(let row=0;row<rowCount;row++){
  const z=-7.5+row*rowGap,tier=row*.18;
  box(18,tier+.12,rowGap,floor,0,(tier+.12)/2-.08,z);
  for(const side of [-1,1])aisleLights.push(box(.07,.04,1.55,new THREE.MeshBasicMaterial({color:'#cb8b55'}),side*8.85,tier+.08,z));
  for(let col=0;col<columnCount;col++)chairs.push({row,col,x:(col-(columnCount-1)/2)*spacing,z,tier});
 }
 // Shared instanced geometry keeps the many empty seats inexpensive.
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),scale=new THREE.Vector3(1,1,1);
 function seatPart(w,h,d,mat,dx,dy,dz,tilt=0){const instances=new THREE.InstancedMesh(new THREE.BoxGeometry(w,h,d),mat,chairs.length);instances.name='empty theater seating';chairs.forEach((s,index)=>{q.setFromEuler(new THREE.Euler(tilt,0,0));matrix.compose(new THREE.Vector3(s.x+dx,s.tier+dy,s.z+dz),q,scale);instances.setMatrixAt(index,matrix);});instances.instanceMatrix.needsUpdate=true;scene.add(instances);}
 seatPart(.9,.2,.86,cushion,0,.6,0);seatPart(.94,1.05,.2,fabric,0,1.15,.44,-.10);seatPart(.13,.13,1.04,metal,-.51,.86,.06);seatPart(.13,.13,1.04,metal,.51,.86,.06);seatPart(.12,.5,.17,metal,0,.28,.22);
 // Wide blank projection, ready for a future movie or dialogue beat.
 box(16.1,7,.28,material('#080a0e'),0,5.6,-13.35);
 const projectionMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0},brightness:{value:1}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv; uniform float brightness; void main(){float edge=pow(max(0.,1.-length((vUv-.5)*vec2(1.1,1.))),.5);vec3 color=mix(vec3(.29,.36,.47),vec3(.69,.78,.87),edge)*brightness;gl_FragColor=vec4(color,1.);}'});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(15.5,6.45),projectionMaterial);screen.name='blank cinema screen';screen.position.set(0,5.6,-13.18);scene.add(screen);
 for(const x of [-5,0,5]){const light=new THREE.PointLight('#c5dbff',38,30,1.3);light.position.set(x,5.3,-10.5);scene.add(light);}
 // Dim projector housing and a very light beam above the seating.
 box(.9,.4,.6,metal,0,7.5,12.8);const lens=new THREE.Mesh(new THREE.CircleGeometry(.12,12),new THREE.MeshBasicMaterial({color:'#afc8dd'}));lens.position.set(0,7.5,12.48);lens.rotation.y=Math.PI;scene.add(lens);
 const beam=new THREE.Mesh(new THREE.ConeGeometry(5.5,25,4,1,true),new THREE.MeshBasicMaterial({color:'#b9d5f0',transparent:true,opacity:.012,depthWrite:false,side:THREE.DoubleSide}));beam.position.set(0,6.4,-.2);beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(0,2,25).normalize());scene.add(beam);
 // Exactly two occupied places: the camera's body and Nina, both in the middle row.
 const centerRow=3,tier=centerRow*.18,seatZ=-7.5+centerRow*rowGap;
 const spawn=new THREE.Vector3(-spacing/2,tier+1.43,seatZ+.1);
 const player=new THREE.Group();player.name='player seated';scene.add(player);
 const pants=material('#35414a');for(const dx of [-.16,.16]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.77),pants);leg.position.set(spawn.x+dx,tier+.78,seatZ-.32);player.add(leg);}
 const nina=new THREE.Group();nina.name='Nina seated';scene.add(nina);
 const white=material('#eceae5'),black=material('#15161a');
 const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.26,.4,.4,6),white);skirt.position.set(spacing/2,tier+.78,seatZ-.1);nina.add(skirt);
 for(const dx of [-.13,.13]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.075,.4,.075),black);leg.position.set(spacing/2+dx,tier+.42,seatZ-.4);nina.add(leg);const shoe=new THREE.Mesh(new THREE.BoxGeometry(.19,.09,.33),black);shoe.position.set(spacing/2+dx,tier+.19,seatZ-.5);nina.add(shoe);}
 // Two aligned seated poses: profile toward the screen and facing the player.
 let upper=null,profile=null,face=null,lastTime=0,turnStarted=null;
 function setPose(frontAmount){if(profile)profile.material.opacity=1-frontAmount;if(face)face.material.opacity=frontAmount;}
 const ninaReady=new THREE.TextureLoader().loadAsync('./assets/nina-cine-pelo-corto.png').then(sheet=>{
  upper=new THREE.Group();upper.name='Nina upper body';upper.position.set(spacing/2,tier+1.35,seatZ+.01);nina.add(upper);
  const height=1.26,width=height*(sheet.image.width/2)/sheet.image.height,geometry=new THREE.PlaneGeometry(width,height);
  function pose(column,name){const texture=sheet.clone();texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.repeat.set(.5,1);texture.offset.set(column*.5,0);texture.needsUpdate=true;const mesh=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));mesh.name=name;upper.add(mesh);return mesh;}
  profile=pose(0,'Nina cinema profile');face=pose(1,'Nina face');face.position.z=.001;
  upper.lookAt(new THREE.Vector3(spawn.x,upper.position.y,spawn.z));setPose(0);
 });
 let bottle=null,bottleCollected=false;
 const bottleTarget=new THREE.Vector3(-1.38,tier+.65,seatZ-.15);
 const bottleReady=loadBottleLabel().then(label=>{bottle=createIncaBottle(label);bottle.scale.setScalar(.36);bottle.position.set(-1.38,tier+.48,seatZ-.15);bottle.visible=!bottleCollected;scene.add(bottle);});
 const ready=Promise.all([ninaReady,bottleReady]);ready.catch(()=>{});
 function canCollectBottle(camera){if(!bottle||bottleCollected)return false;const delta=bottleTarget.clone().sub(camera.position);const direction=new THREE.Vector3();camera.getWorldDirection(direction);return delta.length()<2.2&&direction.dot(delta.normalize())>.94;}
 function collectBottle(camera){if(!canCollectBottle(camera))return false;bottleCollected=true;bottle.visible=false;return true;}

 const lighting=[];scene.traverse(object=>{if(object.isLight)lighting.push({light:object,intensity:object.intensity});});
 const glow=[...aisleLights.map(mesh=>mesh.material),lens.material,beam.material].map(material=>({material,color:material.color.clone()}));
 function dimLights(amount){for(const item of lighting)item.light.intensity=item.intensity*(1-amount);for(const item of glow)item.material.color.copy(item.color).multiplyScalar(1-amount);projectionMaterial.uniforms.brightness.value=1-amount;}
 let conversationStarted=false;
 const talkTarget=new THREE.Vector3(spacing/2,tier+1.5,seatZ+.01);
 function canTalk(camera){const toward=talkTarget.clone().sub(camera.position);const distance=toward.length();const direction=new THREE.Vector3();camera.getWorldDirection(direction);return !conversationStarted&&distance<2.5&&direction.dot(toward.normalize())>.93;}
 return {scene,ready,spawn,talkTarget,screenTarget:new THREE.Vector3(0,5.6,-13.18),chairCount:chairs.length,occupiedSeats:2,centerRow,canTalk,bottleTarget,canCollectBottle,collectBottle,beginConversation(camera){if(!canTalk(camera))return false;conversationStarted=true;turnStarted=lastTime;return true;},reset(alreadyOwned=false){bottleCollected=alreadyOwned;if(bottle)bottle.visible=!alreadyOwned;conversationStarted=false;turnStarted=null;dimLights(0);setPose(0);},closeScene(time){const closing=cinemaClosingTimeline(time);turnStarted=null;setPose(1-closing.ninaTurn);dimLights(closing.darkness);return closing;},update(time){lastTime=time;projectionMaterial.uniforms.time.value=time;if(turnStarted!==null){const t=smooth(0,.65,time-turnStarted);setPose(t);if(t===1)turnStarted=null;}}};
}
