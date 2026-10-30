// Original synthesized speech chirps. No remote audio, video or samples are loaded.
export function createDialogueVoice({contextFactory=()=>new AudioContext()}={}){
 let context=null,enabled=true;const active=new Set();
 function unlock(){if(!context)try{context=contextFactory();}catch{return;}if(context.state==='suspended')context.resume().catch(()=>{});}
 function stop(){for(const osc of active)try{osc.stop();}catch{}active.clear();}
 function tick(speaker,char,index){
  if(!enabled||!/[\p{L}\p{N}]/u.test(char)||!['NINA','TÚ'].includes(speaker))return;
  unlock();if(!context||context.state==='suspended')return;
  const nina=speaker==='NINA',now=context.currentTime,duration=nina?.064:.073;
  const osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
  const variation=((char.codePointAt(0)*17+index*13)%19)/19;
  osc.type=nina?'triangle':'square';
  const frequency=nina?540+variation*360:99+variation*24;
  osc.frequency.setValueAtTime(frequency,now);osc.frequency.exponentialRampToValueAtTime(frequency*(nina?1.15:.9),now+duration);
  filter.type=nina?'bandpass':'lowpass';filter.frequency.value=nina?1600+variation*1300:740;filter.Q.value=nina?1.4:.7;
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(nina?.085:.045,now+.005);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(filter).connect(gain).connect(context.destination);active.add(osc);osc.onended=()=>{active.delete(osc);osc.disconnect();filter.disconnect();gain.disconnect();};osc.start(now);osc.stop(now+duration+.005);
 }
 return {unlock,tick,stop,setEnabled(value){enabled=value;if(!value)stop();},get enabled(){return enabled;}};
}
// Typing and voice share one clock. Completing a line cancels every pending syllable.
export function createDialoguePresenter({output,onTick=()=>{},onComplete=()=>{},schedule=setTimeout,cancel=clearTimeout}){
 let timer=null,text='',speaker='',index=0,active=false;
 function stop(){if(timer!==null)cancel(timer);timer=null;active=false;}
 function complete(){if(!active)return;stop();index=text.length;output(text);onComplete();}
 function step(){timer=null;if(!active)return;const char=text[index];index++;output(text.slice(0,index));if(index%2===1)onTick(speaker,char,index);if(index>=text.length){active=false;onComplete();return;}timer=schedule(step,/[.!?…,]/u.test(char)?125:speaker==='TÚ'?39:31);}
 return {start(value,who){stop();text=value;speaker=who;index=0;output('');if(!text)return;active=true;step();},complete,stop,get active(){return active;}};
}
