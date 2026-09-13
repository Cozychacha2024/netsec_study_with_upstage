import initial from "./terms.json";
type Term=typeof initial[number];
export function restoreSaved(saved:{added?:Term[];stars?:number[];seen?:number[]}|null){
 const ids=new Map<number,number>();let next=100000;
 const added=(saved?.added||[]).filter(t=>t&&typeof t.term==="string"&&typeof t.original==="string").flatMap(t=>{
 const existing=initial.find(x=>x.term===t.term&&x.original===t.original);
 if(existing){ids.set(t.id,existing.id);return []}
 const id=next++;ids.set(t.id,id);return [{...t,id,supplement:typeof t.supplement==="string"?t.supplement:""}];
 });
 const terms=[...initial,...added];const valid=new Set(terms.map(t=>t.id));
 const map=(items:number[]=[])=>[...new Set(items.map(id=>ids.get(id)??id).filter(id=>valid.has(id)))];
 return {terms,stars:map(saved?.stars),seen:map(saved?.seen)};
}
