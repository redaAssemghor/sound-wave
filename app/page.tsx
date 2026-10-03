"use client";
import { useEffect, useRef, useState } from "react";
import { FiActivity, FiArrowDown, FiArrowUpRight, FiBox, FiCheck, FiChevronRight, FiDisc, FiDownload, FiHeadphones, FiLayers, FiMaximize2, FiMusic, FiPause, FiPlay, FiPlus, FiRadio, FiRotateCcw, FiSliders, FiSquare, FiUploadCloud, FiVolume2, FiZap } from "react-icons/fi";
import Visualizer, { VisualSettings } from "./components/Visualizer";
import { createDemo, demos } from "./components/audio";

const format=(n:number)=>Math.floor(n/60)+":"+String(Math.floor(n%60)).padStart(2,"0");
const defaults:VisualSettings={shape:"Sphere",color:"#a995ff",sensitivity:1.2,speed:1,wireframe:true,particles:true};
export default function Home(){
  const [settings,setSettings]=useState(defaults);
  const [selected,setSelected]=useState(0);
  const [title,setTitle]=useState(demos[0].title);
  const [duration,setDuration]=useState(24);
  const [playing,setPlaying]=useState(false);
  const [position,setPosition]=useState(0);
  const [volume,setVolume]=useState(.7);
  const [busy,setBusy]=useState(false);
  const [recording,setRecording]=useState(false);
  const [message,setMessage]=useState("");
  const [dragging,setDragging]=useState(false);
  const [help,setHelp]=useState(false);
  const context=useRef<AudioContext|null>(null);
  const analyser=useRef<AnalyserNode|null>(null);
  const gain=useRef<GainNode|null>(null);
  const destination=useRef<MediaStreamAudioDestinationNode|null>(null);
  const source=useRef<AudioBufferSourceNode|null>(null);
  const buffer=useRef<AudioBuffer|null>(null);
  const offset=useRef(0),started=useRef(0);
  const isPlaying=useRef(false);
  const recorder=useRef<MediaRecorder|null>(null);
  const canvas=useRef<HTMLCanvasElement|null>(null);
  const input=useRef<HTMLInputElement>(null);
  const stage=useRef<HTMLDivElement>(null);
  const loadVersion=useRef(0);
  const settingsUpdate=<K extends keyof VisualSettings>(key:K,value:VisualSettings[K])=>setSettings(s=>({...s,[key]:value}));
  function engine(){
    if(!context.current){
      const ctx=new AudioContext(); context.current=ctx;
      analyser.current=ctx.createAnalyser(); analyser.current.fftSize=1024; analyser.current.smoothingTimeConstant=.55;
      gain.current=ctx.createGain(); gain.current.gain.value=volume;
      destination.current=ctx.createMediaStreamDestination();
      analyser.current.connect(gain.current); gain.current.connect(ctx.destination); gain.current.connect(destination.current);
    }
    return context.current;
  }
  function stopSource(){
    if(source.current){source.current.onended=null;source.current.stop();source.current.disconnect();source.current=null;}
    isPlaying.current=false;setPlaying(false);
  }
  function stopRecording(){if(recorder.current && recorder.current.state!=="inactive") recorder.current.stop();}
  function pause(){
    if(context.current && isPlaying.current) offset.current=Math.min(duration,offset.current+context.current.currentTime-started.current);
    stopSource();setPosition(offset.current);
  }
  async function play(from=offset.current){
    const ctx=engine();await ctx.resume();
    if(!buffer.current) buffer.current=createDemo(ctx,selected<0?0:selected);
    stopSource();
    if(from>=buffer.current.duration) from=0;
    offset.current=from; started.current=ctx.currentTime;
    const node=ctx.createBufferSource();node.buffer=buffer.current;node.connect(analyser.current!);
    node.onended=()=>{ isPlaying.current=false;setPlaying(false);offset.current=0;setPosition(0);source.current=null;node.disconnect();stopRecording(); };
    source.current=node;node.start(0,from);isPlaying.current=true;setPlaying(true);
  }
  async function choose(index:number){
    if(recording||busy)return;
    stopSource();offset.current=0;setPosition(0);setSelected(index);setTitle(demos[index].title);setDuration(24);
    buffer.current=createDemo(engine(),index);setMessage("");await play(0);
  }
  async function upload(file?:File){
    if(!file||recording||busy)return;
    if(file.size>50*1024*1024){setMessage("Choose an audio file under 50 MB.");return;}
    if(!file.type.startsWith("audio/")&&!/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name)){setMessage("Choose an audio file: MP3, WAV, OGG, M4A, or FLAC.");return;}
    const version=++loadVersion.current;setBusy(true);setMessage("Decoding your audio...");
    try{
      const decoded=await engine().decodeAudioData(await file.arrayBuffer());
      if(version!==loadVersion.current)return;
      stopSource();buffer.current=decoded;offset.current=0;setPosition(0);setDuration(decoded.duration);
      setSelected(-1);setTitle(file.name.replace(/\.[^.]+$/,""));setMessage("Audio ready. Press play to bring it to life.");
    }catch{setMessage("This audio could not be decoded. Try an MP3 or WAV file.");}
    finally{if(version===loadVersion.current)setBusy(false);}
  }
  function save(blob:Blob,name:string){
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  async function exportVideo(){
    if(recording){stopRecording();return;}
    if(!canvas.current){setMessage("Wait for the 3D preview to load.");return;}
    if(typeof MediaRecorder==="undefined"||!canvas.current.captureStream){setMessage("Video export requires a browser with MediaRecorder and canvas capture support.");return;}
    const mime=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm","video/mp4"].find(type=>MediaRecorder.isTypeSupported(type));
    if(!mime){setMessage("This browser does not support video export. Try Chrome or Edge.");return;}
    let stream:MediaStream|null=null;
    try{
      const ctx=engine();await ctx.resume();pause();offset.current=0;setPosition(0);
      stream=canvas.current.captureStream(30);
      destination.current!.stream.getAudioTracks().forEach(track=>stream!.addTrack(track.clone()));
      const capture=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000});
      const chunks:Blob[]=[];recorder.current=capture;
      capture.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      capture.onstop=()=>{
        stream?.getTracks().forEach(track=>track.stop());recorder.current=null;setRecording(false);pause();
        if(chunks.length){save(new Blob(chunks,{type:mime}),title.replace(/[^a-z0-9_-]/gi,"-")+"-soundwave."+(mime.includes("mp4")?"mp4":"webm"));setMessage("Your synced 3D video is ready. Download started.");}
      };
      capture.onerror=()=>{setMessage("Recording failed. Try a shorter audio file.");stopRecording();};
      capture.start(250);setRecording(true);setMessage("Exporting in real time with audio. Keep this tab visible. Stop early to save a clip.");
      await play(0);
    }catch{stream?.getTracks().forEach(track=>track.stop());stopRecording();setRecording(false);setMessage("Could not start export. Try Chrome or Edge.");}
  }
  useEffect(()=>{
    const pendingLoad = loadVersion;
    let frame:number;
    const tick=()=>{if(isPlaying.current&&context.current)setPosition(offset.current+context.current.currentTime-started.current);frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);pendingLoad.current++;if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=="inactive")recorder.current.stop();recorder.current.stream.getTracks().forEach(t=>t.stop());}source.current?.stop();void context.current?.close();};
  },[]);
  useEffect(()=>{if(gain.current)gain.current.gain.value=volume;},[volume]);
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="Soundwave home"><span className="brand-icon"><FiActivity/></span>soundwave<span className="brand-dot">.</span></a>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav><a className="nav-item active" href="#studio"><FiBox/> Studio <span className="tiny-dot"/></a><a className="nav-item" href="#sounds"><FiHeadphones/> Sound library <span className="nav-count">03</span></a><button className="nav-item" onClick={()=>setHelp(true)}><FiLayers/> How it works <FiArrowUpRight className="nav-end"/></button></nav>
      <div className="sidebar-bottom"><div className="idea-icon"><FiZap/></div><h3>Sound meets dimension.</h3><p>Make something that looks<br/>as good as it sounds.</p><div className="local-badge"><span/> Runs in your browser</div></div>
      <div className="profile"><div className="avatar">Y</div><div>Your workspace<small>Local creative studio</small></div><FiSliders/></div>
    </aside>
    <main id="studio">
      <header className="topbar"><div>Workspace <FiChevronRight/> <span>Studio</span></div><span className="studio-status"><span/> All systems in sync</span></header>
      <div className="main-content">
        <section className="page-heading"><div><div className="eyebrow">A NEW DIMENSION OF SOUND</div><h1>See what you hear<span>.</span></h1><p>Turn any sound into a living, breathing 3D experience.</p></div><button className="button secondary" disabled={recording||busy} onClick={()=>input.current?.click()}><FiPlus/> Upload audio</button></section>
        <div className="studio-grid">
          <section className="preview-panel">
            <div className="panel-header"><div><span className="live-dot"/><h2>Live preview</h2><span className="subtle-pill">3D CANVAS</span></div><button className="icon-button" aria-label="Enter fullscreen" onClick={()=>{stage.current?.requestFullscreen?.().catch(()=>setMessage("Fullscreen is unavailable in this browser."));}}><FiMaximize2/></button></div>
            <div className="stage" ref={stage}>
              <Visualizer analyser={analyser} settings={settings} canvasRef={canvas}/>
              <div className="stage-top"><span><span className={playing?"live-dot":"idle-dot"}/>{recording?"RECORDING":playing?"AUDIO REACTIVE":"READY TO PLAY"}</span><span>WEBGL / REAL TIME</span></div>
              <div className="stage-caption"><span className="shape-label">{({Sphere:"LIQUID BLOOM",Orbit:"NEON KNOT",Crystal:"PRISM GARDEN"} as Record<string,string>)[settings.shape]} / 0{["Sphere","Orbit","Crystal"].indexOf(settings.shape)+1}</span><span>Drag to explore <FiRotateCcw/></span></div>
              {!playing&&<button className="preview-play" disabled={busy||recording} onClick={()=>void play().catch(()=>setMessage("Playback could not start. Try again."))}><FiPlay/> Bring it to life</button>}
            </div>
            <div className="transport">
              <button className="play-button" aria-label={playing?"Pause":"Play"} disabled={busy||recording} onClick={()=>playing?pause():void play().catch(()=>setMessage("Playback could not start."))}>{playing?<FiPause/>:<FiPlay/>}</button>
              <div className="track-info"><strong>{title}</strong><span>{selected<0?"Your uploaded audio":demos[selected].genre+" / "+demos[selected].bpm+" BPM"}</span></div>
              <div className="seek-wrap"><div className="waveform" aria-hidden="true">{Array.from({length:58},(_,i)=><i key={i} className={i/58<position/duration?"heard":""} style={{height:7+Math.abs(Math.sin(i*2.7)*Math.cos(i*.4))*23}}/>)}</div><input aria-label="Audio position" type="range" min="0" max={duration} step=".1" value={Math.min(position,duration)} disabled={recording||busy} onChange={e=>{const time=Number(e.target.value);offset.current=time;setPosition(time);if(playing)void play(time);}}/></div>
              <span className="time">{format(position)} <span>/ {format(duration)}</span></span>
              <div className="volume"><FiVolume2/><input aria-label="Volume" type="range" min="0" max="1" step=".01" value={volume} disabled={recording} onChange={e=>setVolume(Number(e.target.value))}/></div>
            </div>
          </section>
          <aside className="controls-panel">
            <div className="panel-header"><div><FiSliders/><h2>Make it yours</h2></div><button className="icon-button" aria-label="Reset visual settings" disabled={recording} onClick={()=>setSettings(defaults)}><FiRotateCcw/></button></div>
            <fieldset disabled={recording}><div className="control-section"><label>Shape <span>01</span></label><div className="shape-options">{["Sphere","Orbit","Crystal"].map((shape,i)=><button key={shape} className={settings.shape===shape?"selected":""} aria-pressed={settings.shape===shape} title={["Rippling bloom with orbiting pearls","Twisting trefoil knot","Floating crystal constellation"][i]} onClick={()=>settingsUpdate("shape",shape)}><span className={"shape-preview shape-"+i}/>{["Bloom","Knot","Prism"][i]}</button>)}</div></div>
            <div className="control-section"><label>Color palette <span>02</span></label><div className="colors">{["#a995ff","#65dbcf","#f0a47c","#ef87be","#87b5ff","#eeeeef"].map((color,i)=><button key={color} aria-label={["Lavender","Mint","Apricot","Rose","Sky","Pearl"][i]} aria-pressed={settings.color===color} style={{background:color}} onClick={()=>settingsUpdate("color",color)}>{settings.color===color&&<FiCheck/>}</button>)}</div></div>
            <div className="control-section sliders"><label htmlFor="sensitivity">Audio sensitivity <output>{settings.sensitivity.toFixed(1)}x</output></label><input id="sensitivity" type="range" min=".2" max="2.5" step=".1" value={settings.sensitivity} onChange={e=>settingsUpdate("sensitivity",+e.target.value)}/><label htmlFor="speed">Motion speed <output>{settings.speed.toFixed(1)}x</output></label><input id="speed" type="range" min="0" max="2" step=".1" value={settings.speed} onChange={e=>settingsUpdate("speed",+e.target.value)}/></div>
            <div className="toggles">{(["wireframe","particles"] as const).map(key=><label key={key}><span>{key==="wireframe"?<FiBox/>:<FiRadio/>}{key==="wireframe"?"Wireframe":"Background particles"}</span><input type="checkbox" checked={settings[key]} onChange={e=>settingsUpdate(key,e.target.checked)}/><span className="toggle"/></label>)}</div></fieldset>
            <div className="export-area"><button className="button primary" disabled={busy} onClick={()=>void exportVideo()}>{recording?<FiSquare/>:<FiDownload/>}{recording?"Stop & save video":"Export 3D video"}{!recording&&<FiArrowUpRight/>}</button><p>{recording?"Recording "+format(position)+" / "+format(duration):"Video + audio · 30 FPS · Free to create"}</p></div>
          </aside>
        </div>
        {message&&<div className={"notice "+(recording?"recording":"")} role="status"><FiActivity/>{message}<button aria-label="Dismiss notification" onClick={()=>setMessage("")}>×</button></div>}
        <section className="sound-section" id="sounds"><div className="section-heading"><div><h2>Start with a sound <span>CURATED DEMOS</span></h2><p>Pick a mood. Press play. Watch it take shape.</p></div><span className="original-badge"><FiMusic/> Original synthesized loops</span></div>
          <div className="sound-grid">{demos.map((demo,i)=><button key={demo.id} disabled={recording||busy} onClick={()=>void choose(i).catch(()=>setMessage("Could not play this demo. Please try again."))} className={"sound-card "+(selected===i?"selected":"")} style={{"--track-color":demo.color} as React.CSSProperties}><div className={"album album-"+i}><FiDisc/><div className="album-lines"/></div><div className="sound-details"><strong>{demo.title}</strong><span>{demo.genre} <b>·</b> {demo.bpm} BPM</span><small>{demo.note}</small></div><div className="sound-action">{selected===i&&playing?<FiActivity/>:<FiPlay/>}<span>0:24</span></div></button>)}</div>
          <div role="button" tabIndex={recording||busy?-1:0} aria-label="Upload your audio" aria-disabled={recording||busy} className={"upload-zone "+(dragging?"dragging":"")} onClick={()=>{if(!recording&&!busy)input.current?.click();}} onKeyDown={e=>{if((e.key==="Enter"||e.key===" ")&&!recording&&!busy){e.preventDefault();input.current?.click();}}} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);void upload(e.dataTransfer.files[0]);}}><span className="upload-icon"><FiUploadCloud/></span><div><strong>{busy?"Getting your sound ready...":"Your sound. Your dimension."}</strong><p>Drop an audio file here, or <span>browse files</span></p></div><span className="file-types">MP3, WAV, OGG, M4A, FLAC <b>Up to 50 MB</b></span><FiArrowDown/></div>
          <input ref={input} type="file" className="hidden-input" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" onChange={e=>{void upload(e.target.files?.[0]);e.target.value="";}}/>
        </section>
        <footer><span><FiActivity/> Made for sound. Built for imagination.</span><span>Your audio stays on your device <span className="footer-dot">•</span> SOUNDWAVE STUDIO</span></footer>
      </div>
    </main>
    {help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==="Escape"){setHelp(false);return;}if(e.key==="Tab"){const buttons=e.currentTarget.querySelectorAll<HTMLButtonElement>("button");const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><button autoFocus className="modal-close icon-button" aria-label="Close help" onClick={()=>setHelp(false)}>×</button><FiActivity className="help-mark"/><h2 id="help-title">From sound to dimension.</h2><ol><li>Choose a demo or upload your own audio.</li><li>Press play. Adjust shape, color, sensitivity, and motion.</li><li>Export a video with your audio, captured from the beginning in real time.</li></ol><p>Keep this tab visible during export. Your browser downloads a WebM or MP4 file. Stop early to save a shorter clip. Audio stays on your device.</p><button className="button primary" onClick={()=>setHelp(false)}>Let’s make some waves <FiArrowUpRight/></button></section></div>}
  </div>;
}
