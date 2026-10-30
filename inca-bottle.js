import * as THREE from './vendor/three.module.js';
let labelPromise;
export function loadBottleLabel(){return labelPromise??=new THREE.TextureLoader().loadAsync('./assets/etiqueta-inka-cola.png');}
export function createIncaBottle(label){
 const root=new THREE.Group();root.name='Inca Kola · Nina';const body=new THREE.Group();body.position.y=-1.29;root.add(body);
 const gold=new THREE.MeshStandardMaterial({color:'#e9d943',roughness:.27,metalness:.08,flatShading:true});
 const points=[[.01,.03],[.32,.03],[.4,.12],[.43,.3],[.43,1.75],[.39,1.91],[.21,2.13],[.145,2.23],[.145,2.4]].map(([r,y])=>new THREE.Vector2(r,y));
 const bottle=new THREE.Mesh(new THREE.LatheGeometry(points,16),gold);body.add(bottle);
 const texture=label.clone();texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.offset.x=.28;texture.anisotropy=4;texture.needsUpdate=true;
 const wrap=new THREE.Mesh(new THREE.CylinderGeometry(.446,.446,.69,32,1,true),new THREE.MeshStandardMaterial({map:texture,roughness:.65,side:THREE.DoubleSide}));wrap.name='Etiqueta original del PSD';wrap.position.y=1.1;body.add(wrap);
 const blue=new THREE.MeshStandardMaterial({color:'#1258bb',roughness:.55,flatShading:true});const cap=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.18,16),blue);cap.position.y=2.48;body.add(cap);
 for(const y of [.25,.4,1.62,1.76]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.43,.013,4,16),gold);ring.rotation.x=Math.PI/2;ring.position.y=y;body.add(ring);}
 return root;
}
