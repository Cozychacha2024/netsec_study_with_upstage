import type {CSSProperties} from "react";
import {Trophy} from "lucide-react";

export default function PerfectCelebration(){
 return <div className="perfect-celebration" aria-hidden="true">
  <div className="celebration-glow"/>
  <div className="celebration-confetti">{Array.from({length:18},(_,i)=><i key={i} style={{
   "--x":`${Math.cos(i*Math.PI/9)*(75+i%3*16)}px`,
   "--y":`${Math.sin(i*Math.PI/9)*(58+i%4*9)}px`,
   "--turn":`${i*47}deg`,
   "--delay":`${i%5*.07}s`,
   "--color":["#789cf7","#eec369","#91cbbb","#b69bdf"][i%4],
  } as CSSProperties}/>)}</div>
  <div className="celebration-medal"><div className="medal-face"><Trophy size={52} strokeWidth={1.6}/></div><span className="medal-ribbon left"/><span className="medal-ribbon right"/></div>
  <span className="celebration-shadow"/>
 </div>;
}
