import * as THREE from './vendor/three.module.js';
import {createFifthMusic} from './fifth-music.js';
import {createMemoryFive} from './memory-five.js';
import { createMemoryOne } from './memory-one.js';
import { createUnlockStore } from './unlocked-objects.js';
import { virtualLetterUrl,validateLetterUrl } from './experience-config.js';
import { createObjectViewer } from './object-viewer.js';
import { createMemoryTwo } from './memory-two.js';
import { createMemoryFour } from './memory-four.js';
import { cinemaDialogue } from './cinema-dialogue.js';
import { createMemoryThree,nightEndingTimeline } from './memory-three.js';
import { streetDialogue,windowDialogue } from './night-dialogue.js';
import { createDialogueRunner } from './dialogue.js';
import { createDialogueVoice,createDialoguePresenter } from './dialogue-audio.js';
const $=id=>document.getElementById(id);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true});}catch(e){$('error').hidden=false;document.body.classList.add('no-webgl');$('enter').textContent='Se necesita WebGL para explorar';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();scene.background=new THREE.Color('#092024');scene.fog=new THREE.FogExp2('#092024',.035);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,200);camera.rotation.order='YXZ';
scene.add(new THREE.HemisphereLight('#bddfdf','#18251d',2));
const key=new THREE.DirectionalLight('#ebdfbd',3);key.position.set(2,9,3);scene.add(key);
function box(w,h,d,color,x,y,z,material={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.8,...material}));m.position.set(x,y,z);scene.add(m);return m;}
const floor=new THREE.Mesh(new THREE.CylinderGeometry(16,16,0.3,96),new THREE.MeshStandardMaterial({color:'#263e3d',roughness:.65,metalness:.15}));floor.position.y=-.18;scene.add(floor);
const ring=new THREE.Mesh(new THREE.TorusGeometry(12.7,.018,8,128),new THREE.MeshBasicMaterial({color:'#819a83'}));ring.rotation.x=-Math.PI/2;ring.position.y=.005;scene.add(ring);
// Five doors arranged as a quiet semicircle. Replace each destination as its story is added.
const colors=['#c5bca1','#98b5aa','#b5acb9','#afbaa0','#c2a993'];
const doors=[];
for(let i=0;i<5;i++){
 const a=(i-2)*.39;const x=Math.sin(a)*10,z=-Math.cos(a)*10;const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=-a;scene.add(group);
 const add=(w,h,d,col,px,py,pz,extra={})=>{const m=box(w,h,d,col,0,0,0,extra);scene.remove(m);m.position.set(px,py,pz);group.add(m);return m;};
 add(2.25,.18,1.1,'#53635c',0,.09,0);add(.16,3.75,.32,'#536d67',-1.01,1.97,0);add(.16,3.75,.32,'#536d67',1.01,1.97,0);add(2.18,.17,.32,'#536d67',0,3.81,0);
 const leaf=new THREE.Group();leaf.position.set(-.93,.16,-.045);group.add(leaf);
 const slab=add(1.86,3.56,.12,colors[i],0,1.94,-.045);leaf.attach(slab);const panel=add(1.64,3.28,.025,colors[i],0,1.96,.03,{roughness:.6});leaf.attach(panel);add(.045,3.48,.05,'#e6dfb2',-.94,1.94,.1,{emissive:'#e6dfb2',emissiveIntensity:1.5});
 const handle=add(.045,.18,.09,'#e4d4a4',.63,1.72,.12,{metalness:.7});leaf.attach(handle);
 const portal=add(1.84,3.53,.025,'#ffffff',0,1.94,-.14,{emissive:'#ffffff',emissiveIntensity:5});portal.visible=false;
 const glow=new THREE.PointLight(colors[i],9,6,2);glow.position.set(0,2,1);group.add(glow);
 const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e7e3c9';ctx.textAlign='center';ctx.font='28px Georgia';ctx.fillText('0'+(i+1),128,58);ctx.font='11px sans-serif';ctx.fillText('RECUERDO',128,88);const label=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));label.position.set(0,4.35,0);group.add(label);doors.push({group,index:i,leaf,portal});
}
// Sparse columns and suspended motes keep the architecture simple.
for(let i=0;i<10;i++){const a=i/10*Math.PI*2;box(.18,6,.18,'#253f3e',Math.sin(a)*14,3,Math.cos(a)*14);}
const pos=new Float32Array(180*3);for(let i=0;i<pos.length;i+=3){pos[i]=(Math.random()-.5)*30;pos[i+1]=Math.random()*8;pos[i+2]=(Math.random()-.5)*28;}const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.BufferAttribute(pos,3));const motes=new THREE.Points(geom,new THREE.PointsMaterial({color:'#e1d9ae',size:.035,transparent:true,opacity:.65}));scene.add(motes);
const unlocks=createUnlockStore();
let mode='intro',zone='hub',yaw=0,pitch=0,near=null,transition=null,loadToken=0;const keys=new Set(),visited=new Set();let audioCtx,gain,sound=false,hasSeal=unlocks.has('seal');

const memoryTwo=createMemoryTwo({camera,onDialogue:showDialogue,onPrompt:text=>$('prompt').innerHTML=text});
const memoryFour=createMemoryFour();
const fifthMusic=createFifthMusic();const memoryFive=createMemoryFive();let fifthTime=0,fifthPhoneTime=0,fifthReturnFrom=null;
const memoryOne=createMemoryOne();
const objectViewer=createObjectViewer();objectViewer.resize(innerWidth,innerHeight);
const memoryThree=createMemoryThree();
const hubControls=document.querySelector('.controls').innerHTML;
// Attach a rejection handler immediately: loading errors are shown when entering the memory.
memoryTwo.ready.catch(()=>{});
let choiceIndex=0,ending=null,activeDialogueRunner,streetLook=null,cinemaLook=null;
const dialogueVoice=createDialogueVoice();
const presenter=createDialoguePresenter({output:text=>$('dialogueText').textContent=text,onTick:(speaker,char,index)=>{if(!document.hidden)dialogueVoice.tick(speaker,char,index);},onComplete:()=>{const button=$('choices').querySelector('.continueDialogue');if(button)button.textContent='Enter para continuar ↵';}});
function advanceDialogue(){if(presenter.active){presenter.complete();dialogueVoice.stop();}else activeDialogueRunner.advance();}
$('voiceToggle').onclick=()=>{dialogueVoice.setEnabled(!dialogueVoice.enabled);$('voiceToggle').textContent=dialogueVoice.enabled?'Voces activadas':'Voces apagadas';$('voiceToggle').setAttribute('aria-pressed',String(dialogueVoice.enabled));dialogueVoice.unlock();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)dialogueVoice.stop();});
const dialogueRunner=createDialogueRunner({render:renderDialogue,onGift:()=>{hasSeal=true;unlocks.unlock('seal');updateInventory();memoryTwo.giveGift();$('giftBadge').hidden=false;},onFinish:beginEnding});
const cinemaRunner=createDialogueRunner({script:cinemaDialogue,render:renderDialogue,onGift(){},onFinish:beginCinemaEnding});
const streetRunner=createDialogueRunner({script:streetDialogue,render:renderDialogue,onGift(){},onFinish:beginBedroomTransition});
const windowRunner=createDialogueRunner({script:windowDialogue,render:renderDialogue,onGift(){},onFinish:beginBedTransition});
activeDialogueRunner=dialogueRunner;
function showDialogue(){activeDialogueRunner=dialogueRunner;mode='dialogue';keys.clear();document.exitPointerLock();$('dialogue').hidden=false;$('leaveMemory').hidden=true;dialogueRunner.start();}
function showCinemaDialogue(){if(!memoryFour.beginConversation(camera))return;const aim=new THREE.PerspectiveCamera();aim.position.copy(camera.position);aim.lookAt(memoryFour.talkTarget);cinemaLook={time:0,from:camera.quaternion.clone(),to:aim.quaternion.clone()};activeDialogueRunner=cinemaRunner;mode='dialogue';keys.clear();$('prompt').innerHTML='';$('cinemaCaption').hidden=true;document.exitPointerLock();$('dialogue').hidden=false;$('leaveMemory').hidden=true;cinemaRunner.start();}
function beginCinemaEnding(){cinemaLook=null;presenter.stop();dialogueVoice.stop();mode='cinemaEnding';keys.clear();$('dialogue').hidden=true;$('prompt').innerHTML='';$('cinemaCaption').hidden=true;$('leaveMemory').hidden=true;const targetCamera=new THREE.PerspectiveCamera();targetCamera.position.copy(camera.position);targetCamera.lookAt(memoryFour.screenTarget);ending={time:0,rotation:camera.quaternion.clone(),target:targetCamera.quaternion.clone()};}
function showStreetDialogue(){if(mode!=='play'||zone!=='nightStreet')return;mode='dialogue';keys.clear();streetLook=null;activeDialogueRunner=streetRunner;$('nightCaption').hidden=true;$('prompt').innerHTML='';document.exitPointerLock();$('dialogue').hidden=false;$('leaveMemory').hidden=true;streetRunner.start();}
function beginBedroomTransition(){presenter.stop();dialogueVoice.stop();mode='nightTransition';$('dialogue').hidden=true;$('cinemaFade').classList.add('visible');ending={time:0,switched:false,destination:'window'};}
function beginBedTransition(){presenter.stop();dialogueVoice.stop();mode='nightTransition';$('dialogue').hidden=true;$('cinemaFade').classList.add('visible');ending={time:0,switched:false,destination:'bed'};}
function showWindowDialogue(){mode='dialogue';activeDialogueRunner=windowRunner;keys.clear();$('dialogue').hidden=false;$('leaveMemory').hidden=true;$('nightCaption').hidden=true;windowRunner.start();}
function beginNightEnding(){presenter.stop();dialogueVoice.stop();mode='nightEnding';keys.clear();$('dialogue').hidden=true;document.body.classList.add('night-sleep');const target=new THREE.PerspectiveCamera();target.position.copy(camera.position);target.lookAt(memoryThree.ceilingTarget);ending={time:0,rotation:camera.quaternion.clone(),target:target.quaternion.clone()};}
function resetEyes(){streetLook=null;cinemaLook=null;document.querySelectorAll('#eyelids>div').forEach(lid=>lid.style.height='0vh');document.body.classList.remove('night-sleep');}
function renderDialogue(node,locked){
 if(zone==='nightStreet'&&node.speaker==='NINA'){const aim=new THREE.PerspectiveCamera();aim.position.copy(camera.position);aim.lookAt(memoryThree.streetTalkTarget());streetLook={time:0,from:camera.quaternion.clone(),to:aim.quaternion.clone()};}
 presenter.stop();dialogueVoice.stop();memoryTwo.presentGift(node.event==='gift');choiceIndex=0;$('speaker').textContent=node.speaker;document.querySelector('.dialogueMeta span:last-child').textContent=zone==='cinema'?'RECUERDO 04':zone.startsWith('night')?'RECUERDO 03':'RECUERDO 02';
 $('dialogueText').hidden=!node.text;$('choices').replaceChildren();
 if(node.choices){node.choices.forEach((choice,index)=>{const button=document.createElement('button');button.textContent=(index+1)+'. '+choice.label;button.disabled=locked;button.onclick=()=>activeDialogueRunner.choose(index);button.onfocus=()=>choiceIndex=index;$('choices').append(button);});}
 else{const button=document.createElement('button');button.className='continueDialogue';button.textContent='Enter para continuar ↵';button.onclick=advanceDialogue;$('choices').append(button);}
 $('dialogueHint').textContent=locked?'…':node.choices?'↑ ↓ para elegir · Enter para continuar':'Enter para continuar';
 if(locked)$('dialogueHint').textContent='Un momento…';
 $('choices').querySelector('button:not(:disabled)')?.focus();
 if(node.text){if(node.speaker==='NINA'||node.speaker==='TÚ'){presenter.start(node.text,node.speaker);$('choices').querySelector('.continueDialogue').textContent='Enter para mostrar todo ↵';}else $('dialogueText').textContent=node.text;}
}
function beginEnding(){presenter.stop();dialogueVoice.stop();mode='ending';keys.clear();$('dialogue').hidden=true;$('prompt').innerHTML='';ending={time:0,position:camera.position.clone(),rotation:camera.quaternion.clone()};memoryTwo.finish();}
function finishMemory(index=1){clearFifth();
 ending=null;$('letterReader').hidden=true;resetEyes();visited.add(index);updateCount();dialogueRunner.stop();cinemaRunner.stop();streetRunner.stop();windowRunner.stop();for(const d of doors){d.leaf.rotation.y=0;d.portal.visible=false;}setZone('hub');mode='intro';$('hud').hidden=true;$('leaveMemory').hidden=true;$('intro').hidden=false;$('introFooter').hidden=false;$('caption').hidden=false;$('whiteFlash').classList.remove('visible');$('cinemaFade').classList.remove('visible');$('completion').textContent=index===0?'Carta desbloqueada · Léela en Objetos desbloqueados':index===3?'Recuerdo 04 completado · Compartir el tiempo y gustos juntos':index===2?'Recuerdo 03 completado · La primera noche':'Recuerdo 02 completado · El día de la foca';$('completion').hidden=false;updateInventory();
}
function updateCount(){$('count').textContent=String(visited.size).padStart(2,'0')+' / 05 explorados';}
function setZone(next){
 zone=next;$('parkProgress').hidden=zone!=='park';document.body.classList.toggle('in-park',zone==='park');const night=zone.startsWith('night');document.body.classList.toggle('in-memory',zone==='house');document.body.classList.toggle('in-cinema',zone==='cinema');document.body.classList.toggle('in-night',night);document.body.classList.toggle('in-bedroom',zone==='nightBedroom');
 document.querySelector('.location p').textContent=zone==='park'?'Recuerdo 01 · Nina en el bosque':zone==='house'?'Recuerdo 02 · El día de la foca':zone==='cinema'?'Recuerdo 04 · Compartir el tiempo y gustos juntos':zone==='nightStreet'?'Recuerdo 03 · De la mano':zone==='nightWindow'?'Recuerdo 03 · Frente a la ventana':zone==='nightBedroom'?'Recuerdo 03 · La primera noche':'El lugar de los recuerdos';
 $('count').hidden=zone!=='hub';$('leaveMemory').hidden=zone==='hub';$('giftBadge').hidden=zone==='park'||night||zone==='cinema'||!hasSeal;$('cinemaCaption').hidden=zone!=='cinema';$('nightCaption').hidden=!night;
 $('nightCaption').querySelector('p').textContent=zone==='nightStreet'?'De la mano, un poquito más.':'Una noche para recordar.';
 document.querySelector('.controls').innerHTML=zone==='park'?'<span><b>W A S D</b> caminar</span><span><b>MOUSE</b> mirar</span><span><b>E</b> recoger trozo</span><span><b>SHIFT</b> correr</span><span><b>ESC</b> pausa</span>':zone==='cinema'?'<span><b>MOUSE</b> mirar alrededor</span><span><b>E</b> hablar con Nina</span><span><b>ESC</b> pausa</span>':night?'<span><b>MOUSE</b> mirar alrededor</span><span><b>E</b> conversar</span><span><b>ESC</b> pausa</span>':hubControls;
}
function clearFifth(){fifthMusic.stop();presenter.stop();dialogueVoice.stop();$('dialogue').hidden=true;$('fifthOverlay').hidden=true;$('fifthPlayer').replaceChildren();document.body.classList.remove('in-fifth');$('birthdayWhiteFade').style.opacity='0';}
function returnHub(){clearFifth();$('letterReader').hidden=true;resetEyes();presenter.stop();dialogueVoice.stop();dialogueRunner.stop();cinemaRunner.stop();streetRunner.stop();windowRunner.stop();ending=null;loadToken++;transition=null;for(const d of doors){d.leaf.rotation.y=0;d.portal.visible=false;}setZone('hub');for(const id of ['loading','arrival','dialogue','pause'])$(id).hidden=true;$('whiteFlash').classList.remove('visible');$('cinemaFade').classList.remove('visible');camera.position.set(0,1.65,3);yaw=0;pitch=0;camera.rotation.set(0,0,0);$('prompt').innerHTML='';play();}
$('leaveMemory').onclick=()=>{mode='returning';document.exitPointerLock();returnHub();};
$('cancelMemory').onclick=returnHub;
$('retryMemory').onclick=()=>location.reload();
$('exploreHouse').onclick=()=>{$('arrival').hidden=true;play();};
async function loadHouse(){
 const token=++loadToken;mode='loading';document.exitPointerLock();$('loading').hidden=false;document.querySelector('.loadingMark').textContent='02';$('loadingStatus').textContent='Preparando la casa…';$('retryMemory').hidden=true;
 let timeout;try{await Promise.all([Promise.race([memoryTwo.ready,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('timeout')),15000);})]),new Promise(resolve=>setTimeout(resolve,1300))]);if(token!==loadToken)return;memoryTwo.reset();configureArrival('house');setZone('house');camera.position.set(0,1.65,12);yaw=0;pitch=0;camera.rotation.set(0,0,0);$('loading').hidden=true;$('arrival').hidden=false;mode='arrival';$('whiteFlash').classList.remove('visible');$('cinemaFade').classList.remove('visible');}catch(error){if(token!==loadToken)return;$('loadingStatus').textContent='No se pudo cargar el personaje. Revisa tu conexión y vuelve a intentarlo.';$('retryMemory').hidden=false;}finally{clearTimeout(timeout);}
}
function configureArrival(destination){const cinema=destination==='cinema';$('arrival').querySelector('.eyebrow').textContent=cinema?'RECUERDO 04 · BTS EN EL CINE':'RECUERDO 02 · EL DÍA DE LA FOCA';$('arrival').querySelector('h2').innerHTML=cinema?'Compartir el tiempo<br><i>y gustos juntos.</i>':'El día<br><i>de la foca.</i>';$('arrival').querySelector('p:not(.eyebrow)').textContent=cinema?'Están sentados juntos en las butacas del centro. Mira a tu derecha.':'Camina hacia la casa y acércate a su puerta.';$('exploreHouse').innerHTML=cinema?'Tomar mi asiento <span>↗</span>':'Explorar el recuerdo <span>↗</span>';}
async function loadCinema(){
 const token=++loadToken;mode='loading';document.exitPointerLock();$('loading').hidden=false;document.querySelector('.loadingMark').textContent='04';$('loadingStatus').textContent='Preparando la sala de cine…';$('retryMemory').hidden=true;
 let timeout;try{await Promise.all([Promise.race([memoryFour.ready,new Promise((_,reject)=>timeout=setTimeout(()=>reject(new Error('timeout')),15000))]),new Promise(resolve=>setTimeout(resolve,1000))]);if(token!==loadToken)return;memoryFour.reset(unlocks.has('bottle'));setZone('cinema');configureArrival('cinema');camera.position.copy(memoryFour.spawn);yaw=0;pitch=.16;camera.rotation.set(pitch,yaw,0);$('prompt').innerHTML='';$('loading').hidden=true;$('arrival').hidden=false;mode='arrival';$('whiteFlash').classList.remove('visible');$('cinemaFade').classList.remove('visible');}catch(error){if(token!==loadToken)return;$('loadingStatus').textContent='No se pudo preparar el recuerdo. Revisa tu conexión y vuelve a intentarlo.';$('retryMemory').hidden=false;}finally{clearTimeout(timeout);}
}
async function loadNight(){
 const token=++loadToken;mode='loading';document.exitPointerLock();$('loading').hidden=false;document.querySelector('.loadingMark').textContent='03';$('loadingStatus').textContent='Preparando una noche juntos…';$('retryMemory').hidden=true;
 let timeout;try{await Promise.all([Promise.race([memoryThree.ready,new Promise((_,reject)=>timeout=setTimeout(()=>reject(new Error('timeout')),15000))]),new Promise(resolve=>setTimeout(resolve,1000))]);if(token!==loadToken)return;memoryThree.reset();setZone('nightStreet');camera.position.copy(memoryThree.streetSpawn);yaw=0;pitch=0;camera.rotation.set(0,0,0);$('prompt').innerHTML='';$('arrival').querySelector('.eyebrow').textContent='RECUERDO 03 · LA PRIMERA NOCHE';$('arrival').querySelector('h2').innerHTML='Un poquito<br><i>más contigo.</i>';$('arrival').querySelector('p:not(.eyebrow)').textContent='Caminen juntos de la mano. Pulsa E para conversar o disfruta un momento del paseo.';$('exploreHouse').innerHTML='Caminar juntos <span>↗</span>';$('loading').hidden=true;$('arrival').hidden=false;mode='arrival';$('whiteFlash').classList.remove('visible');$('cinemaFade').classList.remove('visible');}catch(error){if(token!==loadToken)return;$('loadingStatus').textContent='No se pudo preparar la noche. Revisa tu conexión y vuelve a intentarlo.';$('retryMemory').hidden=false;}finally{clearTimeout(timeout);}
}
function updateParkProgress(){const count=memoryOne.count;$('parkPieceCount').textContent=count+' / 5 trozos';[...$('parkDots').children].forEach((dot,index)=>dot.classList.toggle('found',index<count));}
async function loadPark(){const token=++loadToken;mode='loading';document.exitPointerLock();$('loading').hidden=false;document.querySelector('.loadingMark').textContent='01';$('loadingStatus').textContent='Preparando el bosque…';$('retryMemory').hidden=true;await new Promise(resolve=>setTimeout(resolve,800));if(token!==loadToken)return;memoryOne.reset();setZone('park');updateParkProgress();camera.position.copy(memoryOne.spawn);yaw=0;pitch=0;camera.rotation.set(0,0,0);$('prompt').innerHTML='';$('arrival').querySelector('.eyebrow').textContent='RECUERDO 01 · EN LA PIEL DE NINA';$('arrival').querySelector('h2').innerHTML='Cinco pedacitos.<br><i>Una carta para ti.</i>';$('arrival').querySelector('p:not(.eyebrow)').textContent='Sigue los senderos y reúne los cinco trozos. Acércate y pulsa E; mantén Shift para correr.';$('exploreHouse').innerHTML='Buscar la carta <span>↗</span>';$('loading').hidden=true;$('arrival').hidden=false;mode='arrival';$('whiteFlash').classList.remove('visible');$('cinemaFade').classList.remove('visible');}
function collectParkPiece(){const result=memoryOne.collect(camera);if(!result)return;updateParkProgress();if(result.complete){unlocks.unlock('letter');updateInventory();mode='parkAssemble';keys.clear();$('prompt').innerHTML='LOS CINCO TROZOS SE UNEN';$('leaveMemory').hidden=true;document.exitPointerLock();memoryOne.startAssembly(camera);}}
function openVirtualLetter(){if(!unlocks.has('letter'))return;const link=validateLetterUrl(virtualLetterUrl);if(!link){$('inventoryNotice').textContent='La carta virtual estará disponible pronto.';return;}window.open(link,'_blank','noopener,noreferrer');}
function updateInventory(){const count=unlocks.count;$('openInventory').innerHTML='<span class=inventoryButtonKicker>TUS RECUERDOS</span><strong>Objetos<br>desbloqueados <span>↗</span></strong><small>'+count+' / 3 objetos</small>';$('inventoryCount').textContent=count+' de 3 objetos';$('inspectLetter').disabled=!unlocks.has('letter');$('inspectSeal').disabled=!unlocks.has('seal');$('inspectBottle').disabled=!unlocks.has('bottle');$('bottleLock').textContent=unlocks.has('bottle')?'Modelo 3D · Examinar':'Encuentra la botella escondida en el cine';$('letterLock').textContent=unlocks.has('letter')?'Carta virtual · Abrir enlace ↗':'Reúne los cinco trozos en el recuerdo 1';$('sealLock').textContent=unlocks.has('seal')?'Modelo 3D · Examinar':'Recibe el regalo de Nina en el recuerdo 2';}
function showInventory(){document.body.classList.add('viewing-objects');mode='inventory';keys.clear();$('inventoryNotice').textContent='';$('letterReader').hidden=true;$('sealViewerPanel').hidden=true;$('inventoryPanel').hidden=false;updateInventory();$('closeInventory').focus();}
function closeInventory(){document.body.classList.remove('viewing-objects');mode='intro';$('inventoryPanel').hidden=true;$('letterReader').hidden=true;$('sealViewerPanel').hidden=true;$('openInventory').focus();}
$('openInventory').onclick=showInventory;$('closeInventory').onclick=closeInventory;$('inspectLetter').onclick=openVirtualLetter;$('finishLetter').onclick=showInventory;
function inspectObject(id){if(!unlocks.has(id))return;mode='sealViewer';$('inventoryPanel').hidden=true;$('sealViewerPanel').hidden=false;$('sealViewerTitle').textContent=id==='bottle'?'Inca Kola · Nina':'Foca watona';$('objectViewerEyebrow').textContent=(id==='bottle'?'RECUERDO 04':'RECUERDO 02')+' · OBJETO DESBLOQUEADO';objectViewer.select(id);objectViewer.resize(innerWidth,innerHeight);$('closeSealViewer').focus();}
$('inspectSeal').onclick=()=>inspectObject('seal');$('inspectBottle').onclick=()=>inspectObject('bottle');
$('closeSealViewer').onclick=showInventory;$('sealRotateLeft').onclick=()=>objectViewer.rotate(-.25);$('sealRotateRight').onclick=()=>objectViewer.rotate(.25);$('sealZoomIn').onclick=()=>objectViewer.zoom(-.35);$('sealZoomOut').onclick=()=>objectViewer.zoom(.35);
let objectDrag=null;renderer.domElement.addEventListener('pointerdown',event=>{if(mode!=='sealViewer')return;objectDrag={x:event.clientX,y:event.clientY};renderer.domElement.setPointerCapture(event.pointerId);});renderer.domElement.addEventListener('pointermove',event=>{if(mode!=='sealViewer'||!objectDrag)return;objectViewer.rotate((event.clientX-objectDrag.x)*.008,(event.clientY-objectDrag.y)*.005);objectDrag={x:event.clientX,y:event.clientY};});for(const type of ['pointerup','pointercancel'])renderer.domElement.addEventListener(type,()=>objectDrag=null);renderer.domElement.addEventListener('wheel',event=>{if(mode!=='sealViewer')return;event.preventDefault();objectViewer.zoom(event.deltaY*.004);},{passive:false});
updateInventory();
function beginTransition(door){
 mode='transition';keys.clear();$('prompt').innerHTML='';door.portal.visible=true;transition={door,time:0,position:camera.position.clone(),rotation:camera.quaternion.clone()};
}

function loadFifth(){mode='fifthPhone';fifthPhoneTime=0;keys.clear();document.exitPointerLock();setZone('fifth');memoryFive.reset(camera);$('whiteFlash').classList.remove('visible');$('cinemaFade').classList.remove('visible');$('hud').hidden=true;$('leaveMemory').hidden=true;document.body.classList.add('in-fifth');$('fifthOverlay').hidden=false;$('memoryPhone').classList.remove('off');$('phoneIntro').hidden=false;$('phoneOff').disabled=false;$('fifthMusic').hidden=true;$('fifthPlayer').replaceChildren();document.querySelector('.phonePage').scrollTop=0;if(gain)gain.gain.setTargetAtTime(0,audioCtx.currentTime,.4);}
function putPhoneAway(){if(mode!=='fifthPhone')return;mode='fifthCenter';fifthTime=0;fifthReturnFrom=camera.quaternion.clone();$('memoryPhone').classList.add('off');$('phoneIntro').hidden=true;$('phoneOff').disabled=true;}
function startFifthMusic(){mode='fifthCinema';fifthTime=0;$('fifthMusic').hidden=false;fifthMusic.start($('fifthPlayer')).catch(()=>{$('fifthMusic').querySelector('small').textContent='No se pudo cargar YouTube. Vuelve a entrar para reintentar.';});}
function birthdayGreeting(){mode='fifthGreeting';$('dialogue').hidden=false;$('speaker').textContent='TÚ';document.querySelector('.dialogueMeta span:last-child').textContent='RECUERDO 05';$('dialogueText').hidden=false;$('choices').replaceChildren();const button=document.createElement('button');button.className='continueDialogue';button.textContent='Enter para continuar ↵';button.onclick=finishBirthdayGreeting;$('choices').append(button);$('dialogueHint').textContent='Enter para continuar';presenter.start('feliz cumpleaños','TÚ');}
function finishBirthdayGreeting(){if(mode!=='fifthGreeting')return;if(presenter.active){presenter.complete();dialogueVoice.stop();return;}presenter.stop();dialogueVoice.stop();$('dialogue').hidden=true;mode='fifthEnd';fifthTime=0;$('birthdayWhiteFade').style.opacity='0';}
$('phoneOff').onclick=putPhoneAway;
$('exitFifth').onclick=returnHub;
function startAudio(){if(!audioCtx){audioCtx=new AudioContext();gain=audioCtx.createGain();gain.gain.value=0;gain.connect(audioCtx.destination);[110,164.81,220].forEach(f=>{const o=audioCtx.createOscillator();o.frequency.value=f;const g=audioCtx.createGain();g.gain.value=.025;o.connect(g).connect(gain);o.start();});}audioCtx.resume();gain.gain.setTargetAtTime(sound?1:0,audioCtx.currentTime,.5);}
$('sound').onclick=()=>{sound=!sound;startAudio();$('sound').textContent=sound?'Ambiente encendido ↗':'Ambiente apagado ↗';$('sound').setAttribute('aria-pressed',String(sound));};
function lock(){try{const p=renderer.domElement.requestPointerLock();p?.catch(()=>{mode='pause';$('pause').hidden=false;});}catch{mode='pause';$('pause').hidden=false;}}
function play(){mode='play';$('intro').hidden=true;$('introFooter').hidden=true;$('caption').hidden=true;$('hud').hidden=false;$('pause').hidden=true;$('memory').hidden=true;$('leaveMemory').hidden=zone==='hub';keys.clear();lock();}
$('enter').onclick=()=>{dialogueVoice.unlock();setZone('hub');camera.position.set(0,1.65,5);yaw=0;pitch=0;play();};$('resume').onclick=play;$('back').onclick=play;
$('home').onclick=()=>{setZone('hub');mode='intro';$('leaveMemory').hidden=true;$('pause').hidden=true;$('hud').hidden=true;$('intro').hidden=false;$('introFooter').hidden=false;$('caption').hidden=false;};
document.addEventListener('pointerlockchange',()=>{keys.clear();if(!document.pointerLockElement&&mode==='play'){mode='pause';$('pause').hidden=false;}});
document.addEventListener('mousemove',e=>{if(mode==='play'&&document.pointerLockElement){yaw-=e.movementX*.002;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.002,-1.2,1.2);}});
function openDoor(){if(mode!=='play')return;dialogueVoice.unlock();if(zone==='park'){collectParkPiece();return;}if(zone==='house'){memoryTwo.interact();return;}if(zone==='cinema'){if(memoryFour.collectBottle(camera)){unlocks.unlock('bottle');updateInventory();$('objectToast').hidden=false;setTimeout(()=>$('objectToast').hidden=true,4000);return;}showCinemaDialogue();return;}if(zone==='nightStreet'){showStreetDialogue();return;}if(zone==='nightBedroom')return;if(!near)return;if([0,1,2,3,4].includes(near.index)){beginTransition(near);return;}visited.add(near.index);updateCount();$('memoryNumber').textContent='PUERTA 0'+(near.index+1);mode='memory';document.exitPointerLock();$('memory').hidden=false;keys.clear();}
document.addEventListener('keydown',e=>{
 if(mode.startsWith('fifth')){if(e.code==='Escape'){e.preventDefault();returnHub();}else if((e.code==='Enter'||e.code==='NumpadEnter')&&!e.repeat){e.preventDefault();if(mode==='fifthPhone')putPhoneAway();else if(mode==='fifthGreeting')finishBirthdayGreeting();}return;}
 if(['inventory','inventoryLetter','sealViewer'].includes(mode)){if(e.code==='Escape'){e.preventDefault();if(mode==='inventory')closeInventory();else showInventory();}if(mode==='sealViewer'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();objectViewer.rotate(e.code==='ArrowLeft'?-.12:e.code==='ArrowRight'?.12:0,e.code==='ArrowUp'?-.08:e.code==='ArrowDown'?.08:0);}return;}
 if(mode==='dialogue'&&['voiceToggle','sound'].includes(e.target?.id))return;
 if(mode==='dialogue'){
  if(['Enter','NumpadEnter','ArrowUp','ArrowDown','Space','KeyW','KeyA','KeyS','KeyD','KeyE'].includes(e.code)){e.preventDefault();if(e.repeat)return;}
  const buttons=[...$('choices').querySelectorAll('button')];
  if(e.code==='ArrowDown'||e.code==='ArrowUp'){choiceIndex=(choiceIndex+(e.code==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[choiceIndex]?.focus();}
  if(e.code==='Enter'||e.code==='NumpadEnter'){if(activeDialogueRunner.node?.choices)activeDialogueRunner.choose(choiceIndex);else advanceDialogue();}return;
 }
if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&!e.repeat)openDoor();});document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
const clock=new THREE.Clock();let elapsed=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;motes.rotation.y=elapsed*.008;
 if(mode==='fifthPhone'){fifthPhoneTime+=dt;memoryFive.phoneView(camera,fifthPhoneTime);}
 if(mode==='fifthCenter'){fifthTime+=dt;memoryFive.centerView(camera,fifthTime,fifthReturnFrom);if(fifthTime>=2)startFifthMusic();}
 if(mode==='fifthCinema'){fifthTime=fifthMusic.time();const state=memoryFive.update(fifthTime,camera);if(state.fade>0)$('cinemaFade').classList.add('visible');if(state.complete){mode='fifthBirthday';fifthTime=0;memoryFive.showBirthday(camera);}}
 if(mode==='fifthBirthday'){fifthTime+=dt;memoryFive.updateBirthday(fifthTime);if(fifthTime>.5)$('cinemaFade').classList.remove('visible');if(fifthTime>3.5)birthdayGreeting();}
 if(mode==='fifthGreeting')memoryFive.updateBirthday(elapsed);
 if(mode==='fifthEnd'){fifthTime+=dt;memoryFive.updateBirthday(elapsed);const fade=Math.min(fifthTime/5.5,1);$('birthdayWhiteFade').style.opacity=String(fade*fade*(3-2*fade));if(fifthTime>6.2){clearFifth();finishMemory(4);$('completion').textContent='Recuerdo 05 completado · Feliz cumpleaños, Nina';}}

 if(mode==='intro'){camera.position.set(6.6,3.5,12.7);camera.lookAt(.3,1.9,-6);camera.position.y+=Math.sin(elapsed*.3)*.1;}
 if(mode==='play'){camera.rotation.set(pitch,yaw,0);let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));let z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));const len=Math.hypot(x,z)||1;x/=len;z/=len;const speed=zone==='park'&&(keys.has('ShiftLeft')||keys.has('ShiftRight'))?5.2:3.1;const nx=camera.position.x+(x*Math.cos(yaw)+z*Math.sin(yaw))*dt*speed;const nz=camera.position.z+(-x*Math.sin(yaw)+z*Math.cos(yaw))*dt*speed;if(!zone.startsWith('night')&&zone!=='cinema'&&(zone==='park'?memoryOne.canMove(nx,nz):zone==='house'?memoryTwo.canMove(nx,nz):(Math.hypot(nx,nz)<12.2&&!doors.some(d=>Math.hypot(nx-d.group.position.x,nz-d.group.position.z)<1.05)))){camera.position.x=nx;camera.position.z=nz;}
 if(zone==='hub'){near=null;const dir=new THREE.Vector3();camera.getWorldDirection(dir);for(const d of doors){const to=d.group.position.clone().setY(1.65).sub(camera.position);if(to.length()<3&&dir.dot(to.normalize())>.78)near=d;}$('prompt').innerHTML=near?'RECUERDO 0'+(near.index+1)+(near.index===1?' · El día de la foca':near.index===3?' · Compartir el tiempo y gustos juntos':'')+'<br><small>Presiona E para abrir</small>':'';}}
 if(zone==='park'){const ready=memoryOne.update(dt,elapsed);if(mode==='play'){const piece=memoryOne.nearest(camera);$('prompt').innerHTML=piece?'TROZO DE CARTA<br><small>Presiona E para recoger · '+piece.place+'</small>':'';}if(mode==='parkAssemble'&&ready){mode='parkFinish';$('prompt').innerHTML='CARTA DESBLOQUEADA<br><small>Guardada en Objetos desbloqueados</small>';ending={time:0};}}
 if(mode==='parkFinish'&&ending){ending.time+=dt;if(ending.time>.8)$('cinemaFade').classList.add('visible');if(ending.time>1.8)finishMemory(0);}
 if(zone==='nightStreet'&&mode==='dialogue'&&streetLook){streetLook.time+=dt;const t=Math.min(streetLook.time/1.6,1);camera.quaternion.slerpQuaternions(streetLook.from,streetLook.to,t*t*(3-2*t));if(t===1)streetLook=null;}
 if(zone==='nightStreet'){
 const ready=memoryThree.updateStreet(dt,camera,mode==='play');if(mode==='play'){$('prompt').innerHTML='DE LA MANO<br><small>Presiona E para conversar</small>';if(ready)showStreetDialogue();}
 }
 if(mode==='nightTransition'&&ending){
 const e=ending;e.time+=dt;
 if(e.time>1&&!e.switched){e.switched=true;const bed=e.destination==='bed';if(bed)memoryThree.enterBed();else memoryThree.enterWindow();setZone(bed?'nightBedroom':'nightWindow');$('nightCaption').hidden=true;$('leaveMemory').hidden=true;camera.position.copy(bed?memoryThree.bedroomSpawn:memoryThree.windowSpawn);camera.lookAt(bed?memoryThree.bedTalkTarget:memoryThree.windowTarget);}
 if(e.time>1.2)$('cinemaFade').classList.remove('visible');
 if(e.time>2.2){const bed=e.destination==='bed';ending=null;if(bed)beginNightEnding();else showWindowDialogue();}
 }
 if(mode==='nightEnding'&&ending){const e=ending;e.time+=dt;const closing=nightEndingTimeline(e.time);camera.quaternion.slerpQuaternions(e.rotation,e.target,closing.lookUp);document.querySelectorAll('#eyelids>div').forEach(lid=>lid.style.height=(closing.eyes*56)+'vh');if(closing.complete)finishMemory(2);}
 if(zone==='cinema'&&mode==='dialogue'&&cinemaLook){cinemaLook.time+=dt;const t=Math.min(cinemaLook.time/1.5,1);camera.quaternion.slerpQuaternions(cinemaLook.from,cinemaLook.to,t*t*(3-2*t));if(t===1)cinemaLook=null;}
 if(zone==='cinema'){memoryFour.update(elapsed);if(mode==='play')$('prompt').innerHTML=memoryFour.canCollectBottle(camera)?'INCA KOLA<br><small>Presiona E para recoger</small>':memoryFour.canTalk(camera)?'NINA<br><small>Presiona E para hablar</small>':'';}
 if(mode==='cinemaEnding'&&ending){const e=ending;e.time+=dt;const closing=memoryFour.closeScene(e.time);camera.quaternion.slerpQuaternions(e.rotation,e.target,closing.cameraTurn);if(closing.fade)$('cinemaFade').classList.add('visible');if(closing.complete)finishMemory(3);}
 if(zone==='house'){memoryTwo.update(dt,mode==='play');memoryTwo.updatePresentation(elapsed);}
 if(mode==='ending'&&ending){
 const e=ending;e.time+=dt;const first=Math.min(e.time/1.2,1),ease=first*first*(3-2*first);const threshold=new THREE.Vector3(0,1.65,.6);
 if(e.time<1.2)camera.position.lerpVectors(e.position,threshold,ease);else camera.position.lerpVectors(threshold,new THREE.Vector3(0,1.65,-3.7),Math.min((e.time-1.2)/2.2,1));
 camera.quaternion.slerpQuaternions(e.rotation,new THREE.Quaternion(),Math.min(e.time,1));memoryTwo.walkInside(Math.min(e.time/3.4,1));
 if(e.time>2.3)$('whiteFlash').classList.add('visible');if(e.time>3.6)finishMemory();
 }
 if(mode==='transition'&&transition){const t=transition;t.time+=dt;const u=Math.min(t.time/1.4,1),ease=u*u*(3-2*u);t.door.leaf.rotation.y=-ease*Math.PI*.55;const destination=t.door.group.localToWorld(new THREE.Vector3(0,1.65,2));camera.position.lerpVectors(t.position,destination,ease);const look=new THREE.PerspectiveCamera();look.position.copy(camera.position);look.lookAt(t.door.group.localToWorld(new THREE.Vector3(0,1.65,0)));camera.quaternion.slerpQuaternions(t.rotation,look.quaternion,ease);if(t.time>.8)$('whiteFlash').classList.add('visible');if(t.time>1.65){const destination=t.door.index;transition=null;if(destination===0)loadPark();else if(destination===3)loadCinema();else if(destination===2)loadNight();else if(destination===4)loadFifth();else loadHouse();}}
 renderer.render(mode==='sealViewer'?objectViewer.scene:zone==='fifth'?memoryFive.scene:zone==='park'?memoryOne.scene:zone==='house'?memoryTwo.scene:zone==='cinema'?memoryFour.scene:zone==='nightStreet'?memoryThree.street:(zone==='nightBedroom'||zone==='nightWindow')?memoryThree.bedroom:scene,mode==='sealViewer'?objectViewer.camera:camera);}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);objectViewer.resize(innerWidth,innerHeight);});$('enter').disabled=false;$('enter').innerHTML='Entrar a los recuerdos <span>↗</span>';animate();
