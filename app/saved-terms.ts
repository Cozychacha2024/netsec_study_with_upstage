import initial from "./terms.json";
type Term=typeof initial[number];
export const NUMBERING_VERSION=2;
export function restoreSaved(saved:{numberingVersion?:number;added?:Term[];stars?:number[];seen?:number[]}|null){
 const ids=new Map<number,number>();let next=100000;
 // Version 1 skipped 98. Move progress with its term, not with its old label.
 if((saved?.numberingVersion??1)<NUMBERING_VERSION){
  ids.set(98,0); // No built-in term had this ID before the correction.
  for(let oldId=99;oldId<=108;oldId++)ids.set(oldId,oldId-1);
 }
 const added=(saved?.added||[]).filter(t=>t&&typeof t.term==="string"&&typeof t.original==="string").flatMap(t=>{
 const existing=initial.find(x=>x.term===t.term&&x.original===t.original);
 if(existing){ids.set(t.id,existing.id);return []}
 const id=next++;ids.set(t.id,id);return [{...t,id,supplement:typeof t.supplement==="string"?t.supplement:""}];
 });
 const terms=[...initial,...added];const valid=new Set(terms.map(t=>t.id));
 const map=(items:number[]=[])=>[...new Set(items.map(id=>ids.get(id)??id).filter(id=>valid.has(id)))];
 return {numberingVersion:NUMBERING_VERSION,terms,stars:map(saved?.stars),seen:map(saved?.seen)};
}
