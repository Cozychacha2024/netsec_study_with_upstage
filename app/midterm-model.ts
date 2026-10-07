import entries from "./midterm-terms.json";
export const midtermTerms=entries;
export type ExamTerm=typeof entries[number];
export type MemoryStatus="known"|"review";
export type MidtermProgress={statuses:Record<number,MemoryStatus>;bookmarkId:number};
export const MIDTERM_KEY="security-midterm-2026-v1";
export function restoreMidterm(raw:unknown):MidtermProgress{
 if(raw==null)return {statuses:{},bookmarkId:1};
 if(typeof raw!=="object"||Array.isArray(raw))throw Error("Invalid progress");
 const saved=raw as Partial<MidtermProgress>;
 if(!saved.statuses||typeof saved.statuses!=="object"||Array.isArray(saved.statuses))throw Error("Invalid statuses");
 const statuses:Record<number,MemoryStatus>={};
 for(const t of entries){const status=saved.statuses[t.id];if(status==="known"||status==="review")statuses[t.id]=status}
 return {statuses,bookmarkId:entries.some(t=>t.id===saved.bookmarkId)?saved.bookmarkId!:1};
}
export function shuffle<T>(items:readonly T[],random= Math.random){
 const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy;
}
export function makeMidtermTest(){
 // All supplied terms have equal probability; counts are not exam probabilities.
 return shuffle(entries).slice(0,10).map(term=>({term,options:shuffle([term,...shuffle(entries.filter(t=>t.id!==term.id)).slice(0,3)])}));
}
const aliases:Record<number,string[]>={
 1:["Internet Control Message Protocol"],2:["Network Address Translation"],3:["DoS","서비스 거부 공격"],4:["MITM","중간자 공격","Man in the Middle"],
 5:["SYN flooding","SYN 플러딩 공격","TCP SYN 플러딩 공격"],6:["DNS Security Extensions"],7:["Virtual Private Network"],8:["Address Resolution Protocol"],9:["User Datagram Protocol"],10:["MAC address"],
 11:["Firewall"],12:["Domain Name System"],13:["Dynamic Host Configuration Protocol"],14:["Transmission Control Protocol"],15:["Integrity"],16:["Promiscuous mode"],17:["Ethernet"],18:["HTTP proxy"],19:["IP security"],20:["Secure Shell"],21:["Time to Live"],22:["Classless Inter Domain Routing"],23:["도커"],24:["IP fragmentation"],25:["죽음의 핑"],26:["Smurf 공격","스머프","스머프 공격"],27:["Confidentiality"],28:["FIN"],29:["ARP cache poisoning","ARP 캐시 포이즈닝"],30:["RST"],31:["PKI","공개키 기반구조","Public Key Infrastructure"],32:["하트비트"],34:["Router"],35:["IP tunneling"],37:["Application Programming Interface"],38:["Sandbox"],39:["3 way 핸드셰이크","3단계 핸드셰이크","three way handshake"],40:["IP address"],41:["Internet Assigned Numbers Authority"],43:["SYN"],44:["Netmask","네트마스크","서브넷 마스크","Subnet mask"],45:["DNS query","DNS 쿼리"],46:["Domain"],47:["Routing table"],48:["Tunneling"],49:["Kernel"],50:["IP spoofing"],51:["Container"],52:["ARP spoofing"],53:["Ethernet frame"],
};
export function acceptsMidtermAnswer(term:ExamTerm,answer:string){
 const normalize=(value:string)=>value.normalize("NFKC").toLowerCase().replace(/[\s\-·()]/g,"");
 const value=normalize(answer);return !!value&&[term.keyword,...(aliases[term.id]||[])].some(candidate=>normalize(candidate)===value);
}
