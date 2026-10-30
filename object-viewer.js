import * as THREE from './vendor/three.module.js';
import {createIncaBottle,loadBottleLabel} from './inca-bottle.js';
import {createSealModel} from './seal-model.js';
export function createObjectViewer(){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#10272a');scene.fog=new THREE.Fog('#10272a',12,30);
 scene.add(new THREE.HemisphereLight('#e7e3d2','#304342',2.6));const light=new THREE.DirectionalLight('#fff0d9',3);light.position.set(-3,6,5);scene.add(light);
 const rim=new THREE.DirectionalLight('#a5cbd4',2);rim.position.set(4,2,-4);scene.add(rim);
 const seal=createSealModel();seal.position.y=.15;scene.add(seal);
 let bottle=null,selected='seal';
 const ready=loadBottleLabel().then(label=>{bottle=createIncaBottle(label);bottle.scale.setScalar(.7);bottle.position.y=.18;bottle.visible=selected==='bottle';scene.add(bottle);});ready.catch(()=>{});
 function select(id){selected=id;seal.visible=id==='seal';if(bottle)bottle.visible=id==='bottle';reset();}
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(1.75,1.9,.2,32),new THREE.MeshStandardMaterial({color:'#3f5653',roughness:.85}));pedestal.position.y=-.83;scene.add(pedestal);
 const camera=new THREE.PerspectiveCamera(45,1,.1,50);let yaw=.25,pitch=.15,radius=4.7;
 function place(){camera.position.set(Math.sin(yaw)*Math.cos(pitch)*radius,.3+Math.sin(pitch)*radius,Math.cos(yaw)*Math.cos(pitch)*radius);camera.lookAt(0,.15,0);}
 function reset(){yaw=.25;pitch=.15;radius=4.7;place();}
 function rotate(dx,dy=0){yaw+=dx;pitch=THREE.MathUtils.clamp(pitch+dy,-.1,.8);place();}
 function zoom(delta){radius=THREE.MathUtils.clamp(radius+delta,2.7,6.5);place();}
 reset();return {scene,camera,ready,select,reset,rotate,zoom,resize(w,h){camera.aspect=w/h;camera.updateProjectionMatrix();}};
}
