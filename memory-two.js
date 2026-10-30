import * as THREE from './vendor/three.module.js';
import { dialogue } from './dialogue.js';
import { createSealModel } from './seal-model.js';
export function createMemoryTwo({camera, onDialogue, onPrompt}) {
 const scene=new THREE.Scene();scene.background=new THREE.Color('#ffffff');scene.fog=new THREE.Fog('#ffffff',22,65);
 scene.add(new THREE.HemisphereLight('#ffffff','#dbd9d5',3));const sun=new THREE.DirectionalLight('#fff5e9',2.2);sun.position.set(-4,10,6);scene.add(sun);
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.95,...extra});
 const mesh=(geometry,material,x,y,z,parent=scene)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;};
 const b=(w,h,d,color,x,y,z,parent=scene)=>mesh(new THREE.BoxGeometry(w,h,d),mat(color),x,y,z,parent);
 mesh(new THREE.PlaneGeometry(200,200),mat('#ffffff'),0,-.015,0).rotation.x=-Math.PI/2;
 // An isolated little house: walls remain solid around the real doorway.
 b(3.1,3.8,5,'#f4f1eb',-2.55,1.9,-3.5);b(3.1,3.8,5,'#f4f1eb',2.55,1.9,-3.5);b(2,1,5,'#f4f1eb',0,3.3,-3.5);b(8.2,3.8,.2,'#e5e0d8',0,1.9,-6);
 const shape=new THREE.Shape();shape.moveTo(-4.6,0);shape.lineTo(0,2.4);shape.lineTo(4.6,0);shape.closePath();mesh(new THREE.ExtrudeGeometry(shape,{depth:5.9,bevelEnabled:false}),mat('#c9c3b9'),0,3.8,-6.4);
 b(8.6,.16,6,'#e7e3dc',0,.05,-3.5);b(3,.12,1.6,'#e7e3dc',0,.03,-.5);
 // A soft contact shadow, painted procedurally rather than relying on expensive shadow maps.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d');const grad=sc.createRadialGradient(64,64,5,64,64,64);grad.addColorStop(0,'rgba(82,73,60,.18)');grad.addColorStop(1,'rgba(82,73,60,0)');sc.fillStyle=grad;sc.fillRect(0,0,128,128);const shadow=mesh(new THREE.PlaneGeometry(17,12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),0,.001,-3);shadow.rotation.x=-Math.PI/2;
 for(const x of [-2.55,2.55]){b(1.7,1.65,.16,'#d2cbc0',x,2.2,-.96);b(1.4,1.36,.18,'#b5c8cb',x,2.2,-.85);b(.06,1.4,.21,'#f9f6ee',x,2.2,-.73);b(1.4,.06,.21,'#f9f6ee',x,2.2,-.73);}
 b(.12,2.85,.3,'#d4c9b8',-1.06,1.48,-.9);b(.12,2.85,.3,'#d4c9b8',1.06,1.48,-.9);b(2.24,.14,.3,'#d4c9b8',0,2.9,-.9);
 const hinge=new THREE.Group();hinge.position.set(-1,.12,-.82);scene.add(hinge);b(2,2.7,.12,'#acbcb6',1,1.35,0,hinge);b(.07,.16,.12,'#8a7657',1.75,1.3,.11,hinge);
 const bell=b(.23,.34,.12,'#c3baab',1.44,1.5,-.81);b(.095,.095,.14,'#776e60',1.44,1.5,-.73);
 const seal=createSealModel();seal.visible=false;scene.add(seal);let presentingGift=false;
 const textureLoader=new THREE.TextureLoader();let girl=null,assetReady=false;let state='idle',timer=0,doorAngle=0,completed=false;
 const ready=textureLoader.loadAsync('./assets/nina-recuerdo-2.png').then(texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;girl=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));girl.scale.set(2.025*(texture.image.width/texture.image.height),2.025,1);girl.position.set(0,1.1325,-1.05);girl.visible=false;scene.add(girl);assetReady=true;});
 function reset(){state='idle';timer=0;doorAngle=0;hinge.rotation.y=0;completed=false;seal.visible=false;presentingGift=false;if(girl){girl.visible=false;girl.position.set(0,1.1325,-1.05);}}
 function ring(){if(state!=='idle')return;state='waiting';timer=0;onPrompt('Un momento…');chime();}
 // The doorbell is an interaction sound, independent of the ambient music toggle.
 function chime(){try{const a=new AudioContext();a.resume().catch(()=>{});[659.25,523.25].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,a.currentTime);g.gain.setValueAtTime(.16,a.currentTime+i*.38);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+i*.38+.85);o.connect(g).connect(a.destination);o.start(a.currentTime+i*.38);o.stop(a.currentTime+i*.38+.9);});setTimeout(()=>a.close().catch(()=>{}),1800);}catch(error){console.warn('El navegador no pudo reproducir el timbre.',error);}}
 function update(dt,active){if(!active)return;timer+=dt;if(state==='waiting'&&timer>=3){state='opening';timer=0;girl.visible=true;}
 if(state==='opening'){doorAngle=Math.min(1,timer/1.25);hinge.rotation.y=-doorAngle*Math.PI*.52;if(doorAngle===1){state='talking';onPrompt('');onDialogue('greeting');}}
 if(state==='idle'){const distance=camera.position.distanceTo(new THREE.Vector3(1.1,1.65,.1));const forward=new THREE.Vector3();camera.getWorldDirection(forward);const target=new THREE.Vector3(0,1.65,-.8).sub(camera.position).normalize();onPrompt(distance<3&&forward.dot(target)>.65?'LA CASA<br><small>Presiona E para tocar el timbre</small>':'Acércate a la puerta de la casa');}
 if(state==='done'){onPrompt(completed?'Un momento que se queda contigo.':'');}}
 function interact(){if(state==='idle'&&camera.position.distanceTo(new THREE.Vector3(1.1,1.65,.1))<3){const direction=new THREE.Vector3();camera.getWorldDirection(direction);if(direction.dot(new THREE.Vector3(0,1.65,-.8).sub(camera.position).normalize())>.65)ring();}}
 function canMove(x,z){return Math.abs(x)<25&&z<25&&z>-25&&!(Math.abs(x)<4.55&&z<-.15&&z>-6.7);}
 return {scene,ready,reset,update,interact,canMove,dialogue,giveGift(){seal.visible=true;},presentGift(value){presentingGift=value;},updatePresentation(time){if(!seal.visible)return;const offset=presentingGift?new THREE.Vector3(0,.25,-2.5):new THREE.Vector3(1.15,-.6,-2.4);seal.position.copy(offset.applyQuaternion(camera.quaternion).add(camera.position));seal.quaternion.copy(camera.quaternion);seal.rotateY(-.22+Math.sin(time*.6)*.12);seal.scale.setScalar(presentingGift?.63:.25);},walkInside(t){if(girl){girl.position.x=.75*t;girl.position.z=-1.05-3*t;girl.position.y=1.1325+Math.sin(t*Math.PI*12)*.025;}seal.visible=false;},finish(){state='done';completed=true;},get assetReady(){return assetReady;}};
}
