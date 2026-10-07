import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import {resolve} from "node:path";
import ts from "typescript";
const require=createRequire(resolve("app/midterm-model.ts"));
const module={exports:{}};
const code=ts.transpileModule(readFileSync("app/midterm-model.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
new Function("require","module","exports",code)(require,module,module.exports);
const {midtermTerms:terms,makeMidtermTest,acceptsMidtermAnswer:accepts,restoreMidterm}=module.exports;
assert.equal(terms.length,54);
assert.equal(new Set(terms.map(t=>t.keyword)).size,54);
assert.deepEqual(terms.map(t=>t.count),[34,33,33,31,29,28,28,27,27,26,26,24,23,23,23,22,22,21,21,21,21,20,20,20,20,20,20,19,18,18,18,17,17,17,16,16,15,15,14,14,13,13,13,13,12,11,11,10,9,8,8,7,7,6]);
const encountered=new Set();
for(let run=0;run<100;run++){
 const deck=makeMidtermTest();assert.equal(deck.length,10);assert.equal(new Set(deck.map(q=>q.term.id)).size,10);
 for(const q of deck){encountered.add(q.term.id);assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(t=>t.id)).size,4);assert.equal(q.options.filter(t=>t.id===q.term.id).length,1)}
}
assert.equal(encountered.size,54);
for(const t of terms)assert.ok(accepts(t,t.keyword.toLowerCase()));
assert.ok(accepts(terms[2],"dos"));assert.ok(accepts(terms[3],"중간자 공격"));assert.ok(accepts(terms[30],"PKI"));
assert.ok(!accepts(terms[4],"SYN"));assert.ok(!accepts(terms[42],"SYN 플러딩"));
assert.ok(!accepts(terms[34],"터널링"));assert.ok(!accepts(terms[51],"ARP 캐시 감염"));assert.ok(!accepts(terms[53],"HTTPS"));assert.ok(!accepts(terms[0],""));
assert.deepEqual(restoreMidterm(null),{statuses:{},bookmarkId:1});
assert.deepEqual(restoreMidterm({statuses:{1:"known",2:"review",77:"known",3:"bad"},bookmarkId:2}),{statuses:{1:"known",2:"review"},bookmarkId:2});
assert.equal(restoreMidterm({statuses:{},bookmarkId:999}).bookmarkId,1);
assert.throws(()=>restoreMidterm("broken"));assert.throws(()=>restoreMidterm({statuses:[]}));
console.log("PASS: all 54 terms/counts, unique 10-question sampling, four choices, aliases and strict distinctions, progress restoration");
