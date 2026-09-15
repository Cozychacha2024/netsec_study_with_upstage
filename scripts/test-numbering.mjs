import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import ts from 'typescript';

const require = createRequire(resolve('app/saved-terms.ts'));
const terms = require('./terms.json');
const module = {exports:{}};
const compiled = ts.transpileModule(readFileSync('app/saved-terms.ts','utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
}).outputText;
new Function('require','module','exports',compiled)(require,module,module.exports);
const {restoreSaved,NUMBERING_VERSION} = module.exports;
assert.deepEqual(terms.map(t=>t.id),Array.from({length:107},(_,i)=>i+1));
const old = {stars:[97,99,100,108],seen:[99,107,108]};
const restored = restoreSaved(old);
assert.deepEqual(restored.stars,[97,98,99,107]);
assert.deepEqual(restored.seen,[98,106,107]);
assert.equal(terms.find(t=>t.id===restored.stars[1]).term,'TCP SYN 플러딩 공격');
const roundtrip = {numberingVersion:NUMBERING_VERSION,stars:restored.stars,seen:restored.seen,added:[]};
assert.deepEqual(restoreSaved(roundtrip).stars,restored.stars);
assert.deepEqual(restoreSaved(roundtrip).seen,restored.seen);
assert.deepEqual(restoreSaved({numberingVersion:2,stars:[98,99,107],seen:[98]}).stars,[98,99,107]);
assert.deepEqual(restoreSaved({stars:[98]}).stars,[]);
const custom = {id:109,term:'추가 단어',original:'사용자가 입력한 뜻',supplement:''};
const withAdded = restoreSaved({stars:[99,108,109],seen:[109],added:[custom]});
assert.deepEqual(withAdded.stars,[98,107,100000]);
assert.equal(withAdded.terms.at(-1).original,custom.original);
assert.deepEqual(restoreSaved({...roundtrip,stars:withAdded.stars,seen:withAdded.seen,added:withAdded.terms.slice(107)}).stars,withAdded.stars);
assert.equal(restoreSaved({stars:[109],added:[{...terms[97],id:109}]}).stars[0],98);
assert.equal(restoreSaved(null).terms.length,107);
assert.equal(restoreSaved({numberingVersion:2,bookmarkId:52}).bookmarkId,52);
assert.equal(restoreSaved({bookmarkId:108}).bookmarkId,107);
assert.equal(restoreSaved({numberingVersion:2,bookmarkId:99999}).bookmarkId,1);
assert.equal(restoreSaved({bookmarkId:109,added:[custom]}).bookmarkId,100000);
assert.equal(restoreSaved(null).bookmarkId,1);
console.log('PASS: consecutive IDs, legacy progress, repeat migration, current records, custom terms and deduplication');
