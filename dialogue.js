// Guion del recuerdo 02. Los saltos de línea y cada Enter son parte del ritmo.
const nina=(text,next,extra={})=>({speaker:'NINA',text,next,...extra});
const you=(text,next)=>({speaker:'TÚ',text,next});
export const dialogue = {
 greeting:nina('hola miamor','journey'),
 journey:nina('que tal tu camino hasta aca?','journeyChoice'),
 journeyChoice:{speaker:'TÚ',text:'',choices:[
  {label:'un poco cansado, es como si fuera un dejavu',next:'sayDejavu'},
  {label:'fue como si ya hubiera estado afuera',next:'sayOutside'}
 ]},
 sayDejavu:you('un poco cansado, es como si fuera un dejavu','dejavu'),
 sayOutside:you('fue como si ya hubiera estado afuera','outside'),
 sayWatona:you('una foca watona?','watona'),
 saySize:you('depende de que tan grande','laugh'),
 dejavu:nina('que raro, un dejavu','anyway'),
 outside:nina('a si? al menos no fue cansado','anyway'),
 anyway:nina('pero bueno','sealQuestion'),
 sealQuestion:nina('que harias si de la nada aparezco con una foca watona?','giant'),
 giant:nina('pero una foca gigante','sealChoice'),
 sealChoice:{speaker:'TÚ',text:'',choices:[
  {label:'una foca watona?',next:'sayWatona'},
  {label:'depende de que tan grande',next:'saySize'}
 ]},
 watona:nina('Watona watona','emptyHands'),
 laugh:nina('JAJAJAJAJAJA','emptyHands'),
 emptyHands:nina('espero que hayas venido con las manos vacias','giveIntro'),
 giveIntro:nina('para que te lleves esto:','gift'),
 gift:{speaker:'OBJETO RECIBIDO',text:'Nina te entrega un objeto: Foca watona',next:'like',event:'gift'},
 like:nina('y dime... te gusta?','giftChoice'),
 giftChoice:{speaker:'TÚ',text:'',choices:[{label:'es el mejor regalo que me hayan dado',next:'bestGift'}]},
 bestGift:you('es el mejor regalo que me hayan dado','thanks'),
 thanks:you('gracias mi amor','invite'),
 invite:nina('que te parece si entramos?','enterChoice'),
 enterChoice:{speaker:'TÚ',text:'',delay:2000,choices:[{label:'me encantaría...',next:'accept'}]},
 accept:you('me encantaría...',null)
};
// Small state controller shared by mouse and keyboard; a held key cannot skip lines.
export function createDialogueRunner({script=dialogue,render,onGift,onFinish,schedule=setTimeout,cancel=clearTimeout}){
 let current=null,locked=false,timer=null;
 function stop(){if(timer!==null)cancel(timer);timer=null;current=null;locked=false;}
 function show(id){if(timer!==null)cancel(timer);timer=null;current=id;const node=script[id];if(!node)throw new Error('Unknown dialogue: '+id);locked=!!node.delay;if(node.event==='gift')onGift();render(node,locked);if(locked)timer=schedule(()=>{timer=null;locked=false;render(node,false);},node.delay);}
 return {start(){stop();show('greeting');},stop,advance(){if(!current||locked)return;const node=script[current];if(node.choices)return;if(node.next)show(node.next);else{stop();onFinish();}},choose(index){if(!current||locked)return;const choice=script[current].choices?.[index];if(choice)show(choice.next);},get current(){return current;},get node(){return script[current];},get locked(){return locked;}};
}
