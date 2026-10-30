import * as THREE from './vendor/three.module.js';
import {letterContent} from './letter-content.js';
export function createMemoryOne(){
 const scene=new THREE.Scene();scene.name='Recuerdo 01 · La carta del bosque';scene.background=new THREE.Color('#d49c79');scene.fog=new THREE.Fog('#ce9d80',28,95);
 scene.add(new THREE.HemisphereLight('#f0bb90','#344c46',1.35));const sun=new THREE.DirectionalLight('#ffb477',2.1);sun.position.set(-32,9,-30);scene.add(sun);
 const sky=new THREE.Mesh(new THREE.SphereGeometry(300,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w*.9999;}',fragmentShader:'varying vec3 vDirection;void main(){float h=normalize(vDirection).y;vec3 low=vec3(.82,.43,.24);vec3 high=vec3(.25,.29,.40);gl_FragColor=vec4(mix(low,high,smoothstep(0.,.8,h)),1.);}'}));sky.name='orange sunset sky';scene.add(sky);
 const sunsetDisc=new THREE.Mesh(new THREE.SphereGeometry(4,16,10),new THREE.MeshBasicMaterial({color:'#ffd49b',fog:false}));sunsetDisc.name='low sunset sun';sunsetDisc.position.set(-67,11,-71);scene.add(sunsetDisc);
 const mat=color=>new THREE.MeshLambertMaterial({color,flatShading:true});const wood=mat('#6d5b46');
 function box(w,h,d,m,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof m==='string'?mat(m):m);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
 function cylinder(r,h,m,x,y,z,n=8){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),m);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
 box(125,.2,125,'#596d50',0,-.15,0);
 const obstacles=[{x:32,z:-25,r:4.8}];
 const landmarks=[[-29,23],[29,13],[28,-30],[-29,-26],[0,-35]];
 const trails=[[[0,38],[0,20]],[[0,20],[-4,8]],[[-4,8],[0,0]],[[0,0],[6,-12]],[[6,-12],[0,-36]],[[-4,8],[-22,16]],[[-22,16],[-31,24]],[[0,0],[22,5]],[[22,5],[31,14]],[[6,-12],[27,-23]],[[27,-23],[29,-32]],[[0,0],[-20,-14]],[[-20,-14],[-31,-28]]];
 function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],u=THREE.MathUtils.clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-a[0]-dx*u,z-a[1]-dz*u);}
 for(const [a,b] of trails){const dx=b[0]-a[0],dz=b[1]-a[1];const path=box(2.5,.025,Math.hypot(dx,dz)+.6,'#9b9272',(a[0]+b[0])/2,-.012,(a[1]+b[1])/2);path.rotation.y=Math.atan2(dx,dz);cylinder(1.45,.025,mat('#9b9272'),a[0],-.012,a[1],12);}
 for(const [x,z] of landmarks)cylinder(3.6,.025,mat('#768162'),x,-.008,z,14);
 // Hundreds of pines share geometry and materials, keeping the large forest inexpensive.
 let seed=913;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const trees=[];for(let attempt=0;attempt<5000&&trees.length<420;attempt++){
  const x=(random()-.5)*104,z=(random()-.5)*104;
  if(trails.some(([a,b])=>segmentDistance(x,z,a,b)<2.2)||landmarks.some(([lx,lz])=>Math.hypot(x-lx,z-lz)<4.5)||Math.hypot(x-32,z+25)<6.5||Math.hypot(x,z-37)<4)continue;
  if(trees.some(t=>Math.hypot(x-t.x,z-t.z)<2.6))continue;
  trees.push({x,z,h:14+random()*9,r:.25+random()*.24,width:2.1+random()*1.5});
 }
 const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,7),wood,trees.length);trunks.name='forest trunks';scene.add(trunks);
 const crowns=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,7),mat('#60775a'),trees.length*3);crowns.name='forest canopies';scene.add(crowns);
 const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();
 trees.forEach((tree,i)=>{matrix.compose(new THREE.Vector3(tree.x,tree.h*.28,tree.z),rotation,scale.set(tree.r,tree.h*.56,tree.r));trunks.setMatrixAt(i,matrix);for(let layer=0;layer<3;layer++){matrix.compose(new THREE.Vector3(tree.x,tree.h*(.52+.18*layer),tree.z),rotation,scale.set(tree.width*(1-layer*.2),tree.h*.62,tree.width*(1-layer*.2)));crowns.setMatrixAt(i*3+layer,matrix);crowns.setColorAt(i*3+layer,new THREE.Color(['#82906a','#6d866b','#526e5d'][i%3]));}obstacles.push({x:tree.x,z:tree.z,r:tree.r+.08});});trunks.instanceMatrix.needsUpdate=true;crowns.instanceMatrix.needsUpdate=true;
 // Giant tree, fallen trunk, lagoon and a rocky clearing replace the park furniture.
 cylinder(.85,10,wood,31,5,13,10);obstacles.push({x:31,z:13,r:1.05});for(let i=0;i<3;i++){const canopy=new THREE.Mesh(new THREE.IcosahedronGeometry(4.6,1),mat('#6b805a'));canopy.position.set(31+(i-1)*1.8,12.5+i*1.3,13);scene.add(canopy);}
 const log=new THREE.Mesh(new THREE.CylinderGeometry(.57,.65,4.5,10),wood);log.name='fallen forest log';log.rotation.z=Math.PI/2;log.position.set(-31,.56,23);scene.add(log);for(const x of [-32.5,-31,-29.5])obstacles.push({x,z:23,r:.6});
 cylinder(5,.08,mat('#737d68'),32,0,-25,28);const water=cylinder(4.6,.025,new THREE.MeshPhongMaterial({color:'#628e85',shininess:40}),32,.06,-25,28);water.name='forest lagoon';
 for(let i=0;i<12;i++){const angle=i/12*Math.PI*2,x=32+Math.cos(angle)*5.15,z=-25+Math.sin(angle)*5.15;const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,0),mat('#858d80'));rock.position.set(x,.25,z);rock.scale.y=.6;scene.add(rock);}
 for(let i=0;i<7;i++){const x=-32+(i%3)*1.9,z=-29+Math.floor(i/3)*2;const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(.8+(i%2)*.3,0),mat('#899080'));rock.position.set(x,.55,z);rock.scale.set(1,.8,1.3);scene.add(rock);obstacles.push({x,z,r:.9});}
 // Ferns and flowers: modest detail, also instanced.
 const ferns=new THREE.InstancedMesh(new THREE.ConeGeometry(.28,.6,4),mat('#789563'),300);ferns.name='forest floor plants';for(let i=0;i<300;i++){const x=(random()-.5)*95,z=(random()-.5)*95;matrix.compose(new THREE.Vector3(x,.22,z),rotation,scale.set(1,1,1));ferns.setMatrixAt(i,matrix);}ferns.instanceMatrix.needsUpdate=true;scene.add(ferns);
 for(let i=0;i<25;i++){const angle=i*2.4,r=2.5+(i%3)*.3;const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(.10,0),mat('#dfd6b3'));flower.position.set(Math.cos(angle)*r,.13,-35+Math.sin(angle)*r);scene.add(flower);}
 // Discreet trail signs help navigation in the enlarged map.
 function sign(x,z,labels){cylinder(.08,1.6,wood,x,.8,z,6);labels.forEach((label,index)=>{const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const context=canvas.getContext('2d');context.fillStyle='#857258';context.fillRect(0,0,256,64);context.fillStyle='#eee5ce';context.font='20px Georgia';context.textAlign='center';context.fillText(label,128,40);const texture=new THREE.CanvasTexture(canvas);const board=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.45),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));board.position.set(x,1.4-index*.5,z);scene.add(board);});}
 sign(1.8,19,['← Tronco caído','Laguna →']);sign(2,1,['← Claro de rocas','Árbol antiguo →']);sign(7,-13,['← Claro del fondo','Laguna →']);

 // One page texture; each collectible carries its own vertical fifth of the letter.
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=800;const ctx=canvas.getContext('2d');ctx.fillStyle='#f4edda';ctx.fillRect(0,0,640,800);ctx.fillStyle='#73624f';ctx.font='36px Georgia';ctx.fillText(letterContent.title,55,90);ctx.font='19px Georgia';let lineY=155;
 for(const paragraph of letterContent.paragraphs){let line='';for(const word of paragraph.split(' ')){if(ctx.measureText(line+word).width>530){ctx.fillText(line,55,lineY);lineY+=30;line='';}line+=word+' ';}ctx.fillText(line,55,lineY);lineY+=65;}ctx.font='italic 22px Georgia';ctx.fillText(letterContent.signature,55,710);
 const pageTexture=new THREE.CanvasTexture(canvas);pageTexture.colorSpace=THREE.SRGBColorSpace;
 const fragmentLocations=[[-29,23,'el tronco caído'],[29,13,'el árbol centenario'],[28,-30,'la laguna'],[-29,-26,'el claro de rocas'],[0,-35,'el claro del fondo']];
 const fragments=[];const collected=new Set();let assembling=false,assemblyTime=0;
 function stripGeometry(index,w,h){const shape=new THREE.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2+.025);shape.lineTo(w/2-.025,h/2-.08);shape.lineTo(w/2,h/2);shape.lineTo(-w/2+.015,h/2-.018);shape.closePath();const geo=new THREE.ShapeGeometry(shape);const positions=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<positions.count;i++)uv.setXY(i,(index+(positions.getX(i)+w/2)/w)/5,(positions.getY(i)+h/2)/h);return geo;}
 for(const [index,[x,z,place]] of fragmentLocations.entries()){
  const group=new THREE.Group();group.position.set(x,1.25,z);group.name='letter fragment '+(index+1);scene.add(group);
  const mesh=new THREE.Mesh(stripGeometry(index,.32,.8),new THREE.MeshBasicMaterial({map:pageTexture,side:THREE.DoubleSide}));mesh.rotation.z=(index%2?.12:-.1);group.add(mesh);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.38,.012,4,28),new THREE.MeshBasicMaterial({color:'#f0dfa5',transparent:true,opacity:.7}));halo.rotation.x=Math.PI/2;halo.position.y=-.53;group.add(halo);
  const ray=new THREE.Mesh(new THREE.CylinderGeometry(.045,.11,1.8,6),new THREE.MeshBasicMaterial({color:'#f1dfa4',transparent:true,opacity:.15,depthWrite:false}));ray.position.y=-.15;group.add(ray);
  fragments.push({index,group,mesh,place,baseY:1.25});
 }
 const assembled=new THREE.Group();assembled.name='reconstructed letter object';assembled.visible=false;scene.add(assembled);const strips=[];
 for(let i=0;i<5;i++){const mesh=new THREE.Mesh(stripGeometry(i,.25,1.55),new THREE.MeshBasicMaterial({map:pageTexture,side:THREE.DoubleSide}));assembled.add(mesh);strips.push(mesh);}
 const spawn=new THREE.Vector3(0,1.6,37);
 function nearest(camera){const direction=new THREE.Vector3();camera.getWorldDirection(direction);let result=null,best=2.6;for(const f of fragments){if(collected.has(f.index))continue;const toward=f.group.position.clone().sub(camera.position),distance=toward.length();if(distance<best&&direction.dot(toward.normalize())>.84){result=f;best=distance;}}return result;}
 function collect(camera){if(assembling)return null;const f=nearest(camera);if(!f)return null;collected.add(f.index);f.group.visible=false;return {count:collected.size,place:f.place,complete:collected.size===5};}
 function canMove(x,z){return Math.abs(x)<42&&Math.abs(z)<42&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.28);}
 function startAssembly(camera){if(collected.size!==5)return false;assembling=true;assemblyTime=0;assembled.visible=true;assembled.position.copy(new THREE.Vector3(0,.15,-2.3).applyQuaternion(camera.quaternion).add(camera.position));assembled.quaternion.copy(camera.quaternion);return true;}
 function update(dt,time){for(const f of fragments)if(!collected.has(f.index)){f.group.position.y=f.baseY+Math.sin(time*1.5+f.index)*.07;f.mesh.rotation.y=time*.35+f.index*.4;}if(assembling){assemblyTime+=dt;const u=Math.min(assemblyTime/2,1),t=u*u*(3-2*u);strips.forEach((mesh,i)=>{mesh.position.set((i-2)*.25+(i-2)*.34*(1-t),Math.sin(i*2)*.5*(1-t),0);mesh.rotation.z=(i-2)*.18*(1-t);});return assemblyTime>=2.6;}return false;}
 function reset(){collected.clear();assembling=false;assemblyTime=0;assembled.visible=false;for(const f of fragments)f.group.visible=true;}
 return {scene,spawn,forestTreeCount:trees.length,worldSize:84,nearest,collect,canMove,startAssembly,update,reset,letterContent,get count(){return collected.size;},get fragments(){return fragments;}};
}
