"use client";
import {useEffect,useState} from "react";
import {BookOpen,Check,ChevronLeft,ChevronRight,ClipboardCheck,Eye,List,RotateCcw,Target} from "lucide-react";
import PerfectCelebration from "./perfect-celebration";
import {acceptsMidtermAnswer,makeMidtermTest,midtermTerms,restoreMidterm,MIDTERM_KEY,type MidtermProgress,type MemoryStatus} from "./midterm-model";
import "./midterm.css";

type Scope="all"|"unlearned"|"review";
type Answer={id:number;answer:string;correct:boolean};
type Exam={mode:"write"|"choice";deck:ReturnType<typeof makeMidtermTest>;answers:Answer[]};
export default function Midterm(){
 const [view,setView]=useState<"cards"|"test"|"list">("cards");
 const [progress,setProgress]=useState<MidtermProgress>({statuses:{},bookmarkId:1});
 const [loaded,setLoaded]=useState(false);const [storageMessage,setStorageMessage]=useState("");
 const [scope,setScope]=useState<Scope>("all");const [reverse,setReverse]=useState(false);const [revealed,setRevealed]=useState(false);
 const [testMode,setTestMode]=useState<"write"|"choice">("write");const [exam,setExam]=useState<Exam|null>(null);
 const [input,setInput]=useState("");const [choice,setChoice]=useState<number|null>(null);
 const [showFeedback,setShowFeedback]=useState(false);
 const [search,setSearch]=useState("");const [page,setPage]=useState(1);
 useEffect(()=>{
  let active=true;
  Promise.resolve().then(()=>{if(!active)return;try{setProgress(restoreMidterm(JSON.parse(localStorage.getItem(MIDTERM_KEY)||"null")));setLoaded(true)}catch{setStorageMessage("저장 기록을 읽지 못해 자동 저장을 중단했어요. 기존 기록은 보존됩니다.")}});
  return()=>{active=false};
 },[]);
 useEffect(()=>{
  if(loaded)try{localStorage.setItem(MIDTERM_KEY,JSON.stringify(progress))}catch{
   // eslint-disable-next-line react-hooks/set-state-in-effect -- Report failure of the external storage write without changing study data.
   setStorageMessage("이 브라우저에 암기 기록을 저장하지 못했어요.");
  }
 },[progress,loaded]);
 const included=(id:number,statuses=progress.statuses)=>scope==="all"||(scope==="unlearned"?statuses[id]!=="known":statuses[id]==="review");
 const pool=midtermTerms.filter(t=>included(t.id));
 const current=pool.find(t=>t.id===progress.bookmarkId)||pool[0];
 const known=Object.values(progress.statuses).filter(s=>s==="known").length;
 const review=Object.values(progress.statuses).filter(s=>s==="review").length;
 function openCard(id:number){setProgress(p=>({...p,bookmarkId:id}));setRevealed(false)}
 function moveCard(step:number){if(current&&pool.length)openCard(pool[(pool.indexOf(current)+step+pool.length)%pool.length].id)}
 function mark(status:MemoryStatus){
  if(!current||!revealed)return;
  const statuses={...progress.statuses,[current.id]:status};
  const ordered=[...pool.slice(pool.indexOf(current)+1),...pool.slice(0,pool.indexOf(current))];
  const next=ordered.find(t=>included(t.id,statuses));
  setProgress({statuses,bookmarkId:next?.id??current.id});setRevealed(false);
 }
 function startTest(){setExam({mode:testMode,deck:makeMidtermTest(),answers:[]});setInput("");setChoice(null);setShowFeedback(false);setView("test")}
 function submit(skip=false){
  if(!exam||showFeedback||exam.answers.length>=exam.deck.length)return;
  if(!skip&&(exam.mode==="write"?!input.trim():choice===null))return;
  const {term,options}=exam.deck[exam.answers.length];
  const answer=skip?"":exam.mode==="write"?input.trim():options.find(t=>t.id===choice)?.keyword||"";
  const correct=!skip&&(exam.mode==="write"?acceptsMidtermAnswer(term,answer):choice===term.id);
  setExam({...exam,answers:[...exam.answers,{id:term.id,answer,correct}]});setShowFeedback(true);
 }
 function nextQuestion(){setShowFeedback(false);setInput("");setChoice(null)}
 const complete=!!exam&&!showFeedback&&exam.answers.length===exam.deck.length;
 const score=exam?.answers.filter(a=>a.correct).length||0;
 const wrong=exam?.answers.filter(a=>!a.correct)||[];
 function reviewMistakes(){
  if(!wrong.length)return;
  setProgress(p=>({...p,bookmarkId:wrong[0].id,statuses:{...p.statuses,...Object.fromEntries(wrong.map(a=>[a.id,"review" as const]))}}));
  setScope("review");setView("cards");setRevealed(false);
 }
 const list=midtermTerms.filter(t=>`${t.keyword} ${t.description}`.toLowerCase().includes(search.trim().toLowerCase()));
 const pageCount=Math.ceil(list.length/10);
 const questionIndex=exam?exam.answers.length-(showFeedback?1:0):0;
 const question=exam&&!complete?exam.deck[questionIndex]:null;
 const feedback=showFeedback?exam?.answers[exam.answers.length-1]:null;
 return <section className="midterm" aria-label="중간고사 대비 학습">
  <div className="midterm-overview"><div className="midterm-overview-title"><span className="midterm-icon"><Target size={24}/></span><div><strong>54개 개념, 10문제로 확인하기</strong><p>제공된 중간고사 범위만 모았어요.</p></div></div><div className="midterm-counts"><span>암기 완료 <b>{known}<small> / 54</small></b></span><span>다시 볼 용어 <b>{review}</b></span></div></div>
  <div className="midterm-tabs" role="group" aria-label="중간고사 학습 방식">
   <button aria-pressed={view==="cards"} onClick={()=>setView("cards")}><BookOpen size={17}/>암기 확인</button>
   <button aria-pressed={view==="test"} onClick={()=>setView("test")}><ClipboardCheck size={17}/>랜덤 10문제</button>
   <button aria-pressed={view==="list"} onClick={()=>setView("list")}><List size={17}/>전체 범위</button>
  </div>
  {storageMessage&&<p className="midterm-notice" role="status">{storageMessage}</p>}
  {view==="cards"&&<>
   <div className="midterm-tools"><div className="midterm-filters" role="group" aria-label="암기 범위">{([['all','전체'],['unlearned','아직 외우지 않은 용어'],['review','다시 볼 용어']] as const).map(([value,label])=><button key={value} aria-pressed={scope===value} onClick={()=>{setScope(value);setRevealed(false)}}>{label}</button>)}</div><button className="midterm-direction" onClick={()=>{setReverse(r=>!r);setRevealed(false)}}><RotateCcw size={14}/>{reverse?"설명 → 키워드":"키워드 → 설명"}</button></div>
   {current?<article className="midterm-card">
    <div className="midterm-card-meta"><span>암기 확인 · {pool.indexOf(current)+1} / {pool.length}</span><span>카운트 {current.count}</span></div>
    <span className="midterm-label">{reverse?"이 설명의 키워드를 떠올려 보세요":"이 키워드의 설명을 떠올려 보세요"}</span>
    <h2 className={reverse?"midterm-description":""}>{reverse?current.description:current.keyword}</h2>
    {revealed?<div className="midterm-revealed"><span>{reverse?"키워드":"설명"}</span><p>{reverse?current.keyword:current.description}</p></div>:<button className="midterm-reveal" onClick={()=>setRevealed(true)}><Eye size={19}/>{reverse?"키워드 확인":"설명 확인"}</button>}
    <div className="midterm-memory-actions"><button disabled={!revealed} onClick={()=>mark("review")}><RotateCcw size={16}/>다시 볼게요</button><button disabled={!revealed} onClick={()=>mark("known")}><Check size={17}/>외웠어요</button></div>
    <div className="midterm-card-nav"><button onClick={()=>moveCard(-1)} aria-label="이전 암기 카드"><ChevronLeft size={17}/>이전</button><small>{progress.statuses[current.id]==="known"?"암기 완료한 용어":progress.statuses[current.id]==="review"?"다시 확인할 용어":"설명을 확인한 뒤 암기 상태를 표시해 주세요."}</small><button onClick={()=>moveCard(1)} aria-label="다음 암기 카드">다음<ChevronRight size={17}/></button></div>
   </article>:<div className="midterm-empty"><Check size={30}/><h2>{scope==="unlearned"?"모든 용어를 확인했어요!":"다시 볼 용어가 없어요."}</h2><p>전체 범위를 복습하거나 랜덤 테스트로 확인해 보세요.</p><button onClick={()=>setScope("all")}>전체 범위로 돌아가기</button></div>}
  </>}
  {view==="test"&&(!exam?<div className="midterm-test-start">
   <span className="midterm-test-icon"><ClipboardCheck size={32}/></span><h2>중간고사 대비 테스트</h2><p>54개 중 중복 없이 무작위 10문제.<br/>한 문제씩 풀고 정답과 설명을 바로 확인해요.</p>
   <div className="midterm-mode" role="group" aria-label="테스트 문제 방식"><button aria-pressed={testMode==="write"} onClick={()=>setTestMode("write")}>직접 입력</button><button aria-pressed={testMode==="choice"} onClick={()=>setTestMode("choice")}>객관식</button></div>
   <p className="midterm-help">{testMode==="write"?"설명을 읽고 키워드를 입력하세요. 띄어쓰기·영문 대소문자는 구분하지 않아요.":"설명을 읽고 네 가지 보기 중 정답을 고르세요."}</p><button className="midterm-primary" onClick={startTest}>랜덤 10문제 시작<ChevronRight size={17}/></button>
  </div>:complete?<div className="midterm-results">
   <div className="midterm-result-summary" role="status">{score===10?<PerfectCelebration/>:<ClipboardCheck size={38}/>}<h2>테스트 완료!</h2><div className="midterm-score">{score}<small> / 10</small></div><p>{score===10?"모든 문제를 정확히 맞혔어요. 축하해요!":`틀린 ${wrong.length}개 용어를 한 번 더 확인해 보세요.`}</p></div>
   <div className="midterm-result-actions">{wrong.length>0&&<button className="midterm-primary" onClick={reviewMistakes}>오답 암기 확인</button>}<button onClick={()=>{setExam(null);setInput("");setChoice(null)}}><RotateCcw size={16}/>새 테스트 준비</button></div>
   <h3>답안 확인</h3><ol className="midterm-answer-list">{exam.answers.map((a,i)=>{const term=exam.deck[i].term;return <li key={a.id} className={a.correct?"is-correct":"is-wrong"}><div><span className="midterm-answer-state">{a.correct?"정답":"오답"}</span><strong>{i+1}. {term.keyword}</strong></div><p className="midterm-user-answer">내 답: {a.answer||"모르겠어요"}</p><p>{term.description}</p></li>})}</ol>
  </div>:question&&<form className="midterm-question" onSubmit={e=>{e.preventDefault();submit()}}>
   <div className="midterm-card-meta"><span>No {String(questionIndex+1).padStart(2,"0")} / 10</span><span>{exam.mode==="write"?"직접 입력":"객관식"}</span></div><progress value={exam.answers.length} max={10} aria-label="답안을 제출한 문제 수"/>
   <span className="midterm-label">설명에 맞는 키워드는 무엇일까요?</span><h2 className="midterm-description" key={question.term.id}>{question.term.description}</h2>
   {exam.mode==="write"?<label className="midterm-input">정답 키워드<input key={question.term.id} name="midterm-answer" autoComplete="off" value={input} readOnly={showFeedback} maxLength={200} onChange={e=>setInput(e.target.value)} placeholder="키워드를 입력하세요"/></label>:<div className="midterm-options" role="group" aria-label="정답 보기">{question.options.map((t,i)=><button type="button" key={t.id} disabled={showFeedback} className={showFeedback?(t.id===question.term.id?"answer-correct":t.id===choice?"answer-wrong":""):""} aria-pressed={choice===t.id} onClick={()=>setChoice(t.id)}><span>{i+1}</span>{t.keyword}{showFeedback&&t.id===question.term.id&&<Check size={16} aria-label="정답"/>}</button>)}</div>}
   {feedback&&<div className={`midterm-feedback ${feedback.correct?"is-correct":"is-wrong"}`} role="status" aria-live="polite"><strong>{feedback.correct?"정답이에요!":"다시 기억해 주세요"}</strong><p className="midterm-feedback-answer">정답: {question.term.keyword}</p>{!feedback.correct&&<p>내 답: {feedback.answer||"모르겠어요"}</p>}<p>{question.term.description}</p></div>}
   <div className="midterm-submit">{showFeedback?<button type="button" className="midterm-primary midterm-next" onClick={nextQuestion}>{exam.answers.length===10?"결과 확인":"다음 문제"}<ChevronRight size={16}/></button>:<><button type="button" onClick={()=>submit(true)}>모르겠어요</button><button type="submit" className="midterm-primary" disabled={exam.mode==="write"?!input.trim():choice===null}>정답 확인<Check size={16}/></button></>}</div>{!showFeedback&&<p className="midterm-help">답을 제출하면 정답과 설명을 바로 확인할 수 있어요.</p>}
  </form>)}
  {view==="list"&&<div className="midterm-range"><label className="midterm-search">범위 검색<input type="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="키워드 또는 설명 검색"/></label><p className="midterm-help">{list.length}개 · 제공된 카운트순</p><div className="midterm-range-list">{list.slice((page-1)*10,page*10).map(t=><article key={t.id}><div><span className="midterm-range-number">{String(t.id).padStart(2,"0")}</span><h3>{t.keyword}</h3><span className="midterm-frequency">{t.count}</span></div><p>{t.description}</p><button onClick={()=>{setScope("all");openCard(t.id);setView("cards")}}>이 용어 암기 확인<ChevronRight size={14}/></button></article>)}</div>{!list.length&&<p className="midterm-empty">검색 결과가 없어요.</p>}{pageCount>1&&<nav className="midterm-pagination" aria-label="중간고사 범위 페이지"><button disabled={page===1} onClick={()=>setPage(p=>p-1)} aria-label="범위 이전 페이지"><ChevronLeft size={16}/></button>{Array.from({length:pageCount},(_,i)=><button key={i} aria-label={`범위 ${i+1}페이지`} aria-current={page===i+1?"page":undefined} onClick={()=>setPage(i+1)}>{i+1}</button>)}<button disabled={page===pageCount} onClick={()=>setPage(p=>p+1)} aria-label="범위 다음 페이지"><ChevronRight size={16}/></button></nav>}</div>}
  <p className="midterm-footnote">카운트는 제공된 표의 집계값이며 출제 확률을 뜻하지 않아요.<br/>암기 기록과 학습 위치는 이 브라우저에 자동 저장돼요.</p>
 </section>;
}
