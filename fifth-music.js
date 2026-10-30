// The official player supplies playback time; the light pulses are choreographed,
// not a real-time frequency analysis of the cross-origin YouTube audio.
let apiPromise;
function youtubeAPI(){if(globalThis.YT?.Player)return Promise.resolve(globalThis.YT);return apiPromise??=new Promise((resolve,reject)=>{const previous=globalThis.onYouTubeIframeAPIReady;globalThis.onYouTubeIframeAPIReady=()=>{previous?.();resolve(globalThis.YT);};const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{apiPromise=null;reject(new Error('YouTube unavailable'));};document.head.append(script);});}
export function createFifthMusic(){let player=null,generation=0;
 function stop(){generation++;player?.destroy();player=null;}
 async function start(container){stop();const request=generation;const YT=await youtubeAPI();if(request!==generation)return;const mount=document.createElement('div');container.replaceChildren(mount);player=new YT.Player(mount,{width:200,height:200,videoId:'Q49pnA4jsp8',playerVars:{autoplay:1,playsinline:1,rel:0,origin:location.origin},events:{onReady:event=>{if(request===generation)event.target.playVideo();}}});}
 function time(){if(!player?.getCurrentTime)return 0;const value=player.getCurrentTime();return Number.isFinite(value)?value:0;}
 return {start,stop,time};
}
