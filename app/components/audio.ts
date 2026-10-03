export const demos = [
  { id: "midnight", title: "Midnight drive", genre: "Synthwave", bpm: 110, duration: 24, color: "#a995ff", note: "Warm synths. Infinite highways." },
  { id: "afterglow", title: "Afterglow", genre: "Ambient", bpm: 80, duration: 24, color: "#65dbcf", note: "A little space to drift." },
  { id: "pulse", title: "Electric pulse", genre: "Electronic", bpm: 128, duration: 24, color: "#f0a47c", note: "Big bass. Bigger energy." },
];
export function createDemo(context: AudioContext, index: number) {
  const demo=demos[index], rate=context.sampleRate, buffer=context.createBuffer(2,rate*demo.duration,rate);
  const roots=[110,130.81,65.41], root=roots[index], beat=60/demo.bpm;
  for(let channel=0;channel<2;channel++){
    const data=buffer.getChannelData(channel);
    for(let i=0;i<data.length;i++){
      const t=i/rate, b=t%beat, step=Math.floor(t/(beat/2)), notes=[1,1.5,2,1.25,1.5,2,1.25,1.5];
      const f=root*notes[step%8], env=Math.exp(-((t%(beat/2))/(beat/2))*5);
      const pad=(Math.sin(2*Math.PI*root*t)+Math.sin(2*Math.PI*root*1.5*t+channel*.2)+Math.sin(2*Math.PI*root*2.002*t))*.045;
      const lead=Math.sin(2*Math.PI*f*2*t+Math.sin(t*3)*.7)*env*(index===1?.05:.13);
      const kick=Math.sin(2*Math.PI*(48*b+9*(1-Math.exp(-b*35))))*Math.exp(-b*18)*(index===1?.12:.4);
      const noise=(Math.sin(i*78.233+channel)*43758.5453)%1;
      const hat=noise*Math.exp(-(t%(beat/2))*95)*.045;
      const fade=Math.min(t/1,1,(demo.duration-t)/1.5);
      data[i]=Math.tanh((pad+lead+kick+hat)*1.3)*fade;
    }
  }
  return buffer;
}
