import * as THREE from './vendor/three.module.js';
// Faceted, round spotted plush seal, modeled from the user's reference.
export function createSealModel(){
 const seal=new THREE.Group();seal.name='Foca watona';
 // A tiny nearest-filtered procedural texture keeps the spots deliberately retro.
 let seed=146;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const w=128,h=64,data=new Uint8Array(w*h*4);const spots=Array.from({length:140},()=>({x:rand()*w,y:rand()*h*.85,r:1+rand()*2.3,dark:rand()}));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  let col=y>h*.77?[213,219,217]:[180,190,191];
  for(const s of spots){const dx=Math.min(Math.abs(x-s.x),w-Math.abs(x-s.x));if((dx*dx)/(s.r*s.r)+(y-s.y)**2/(s.r*s.r*.65)<1){col=s.dark>.4?[125,141,145]:[204,213,213];break;}}
  const i=(y*w+x)*4;data.set([...col,255],i);
 }
 const texture=new THREE.DataTexture(data,w,h);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;
 const spotted=new THREE.MeshLambertMaterial({map:texture,flatShading:true,color:'#edf1ed'});
 const plain=color=>new THREE.MeshLambertMaterial({color,flatShading:true});
 const gray=plain('#cdd5d3'),dark=plain('#283333'),muzzle=plain('#dfe4de');
 function part(name,pos,scale,material,segments=12,rings=8){const m=new THREE.Mesh(new THREE.SphereGeometry(1,segments,rings),material);m.name=name;m.position.set(...pos);m.scale.set(...scale);seal.add(m);return m;}
 // One continuous, nearly spherical body: the face is embedded rather than a separate head.
 part('round spotted body',[0,0,0],[1.03,.87,.94],spotted,16,12);
 const left=part('left flipper',[-.99,-.53,.05],[.42,.09,.22],spotted,8,4);left.rotation.z=.28;left.rotation.y=-.3;
 const right=part('right flipper',[.99,-.53,.05],[.42,.09,.22],spotted,8,4);right.rotation.z=-.28;right.rotation.y=.3;
 part('tail stem',[0,-.29,-.98],[.28,.12,.29],spotted,8,4);
 const tailA=part('left tail',[-.19,-.24,-1.2],[.29,.08,.32],spotted,8,4);tailA.rotation.y=-.5;
 const tailB=part('right tail',[.19,-.24,-1.2],[.29,.08,.32],spotted,8,4);tailB.rotation.y=.5;
 // Slightly narrowed shiny black eyes, the pale muzzle, and a tiny triangular nose.
 part('left eye',[-.28,.23,.875],[.115,.047,.027],dark,8,4).rotation.z=-.13;
 part('right eye',[.28,.23,.875],[.115,.047,.027],dark,8,4).rotation.z=.13;
 part('left eye glint',[-.305,.244,.9],[.022,.012,.009],gray,6,4);
 part('right eye glint',[.255,.244,.9],[.022,.012,.009],gray,6,4);
 part('left muzzle',[-.12,.045,.91],[.24,.16,.065],muzzle,10,6);
 part('right muzzle',[.12,.045,.91],[.24,.16,.065],muzzle,10,6);
 const noseGeometry=new THREE.BufferGeometry();noseGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.07,.11,.993,.07,.11,.993,0,.035,1.01],3));noseGeometry.computeVertexNormals();const nose=new THREE.Mesh(noseGeometry,new THREE.MeshBasicMaterial({color:'#586366',side:THREE.DoubleSide}));nose.name='triangle nose';seal.add(nose);
 const lines=[];lines.push(0,.04,1.005,0,-.04,1.005);lines.push(0,-.04,1.005,-.08,-.075,.99);lines.push(0,-.04,1.005,.08,-.075,.99);
 for(const side of [-1,1])for(let i=0;i<3;i++)lines.push(side*.16,.04-i*.035,.99,side*.44,.10-i*.07,.93);
 const whiskers=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3)),new THREE.LineBasicMaterial({color:'#788586'}));whiskers.name='mouth and whiskers';seal.add(whiskers);
 return seal;
}
