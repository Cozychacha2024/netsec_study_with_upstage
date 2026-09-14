import {Fragment} from "react";

// A pipe marks a natural phrase boundary; desktop keeps an ordinary space.
export default function ResponsiveCopy({text}:{text:string}){
 return <>{text.split("|").map((part,i)=><Fragment key={i}>{i>0&&<><span className="desktop-copy-space"> </span><br className="mobile-copy-break"/></>}{part}</Fragment>)}</>;
}
