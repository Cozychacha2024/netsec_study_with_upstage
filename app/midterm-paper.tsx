"use client";

import {Check,ClipboardCheck,RotateCcw} from "lucide-react";
import type {makeMidtermTest} from "./midterm-model";
import PerfectCelebration from "./perfect-celebration";

type Props={
 mode:"write"|"choice";
 deck:ReturnType<typeof makeMidtermTest>;
 answers:{id:number;answer:string;correct:boolean}[];
 drafts:Record<number,string>;
 onChange:(id:number,value:string)=>void;
 onGrade:(id?:number)=>void;
 onReview:()=>void;
 onRestart:()=>void;
};

export default function MidtermPaper({mode,deck,answers,drafts,onChange,onGrade,onReview,onRestart}:Props){
 const complete=answers.length===deck.length;
 const correct=answers.filter(a=>a.correct).length;
 const filled=deck.filter(({term})=>answers.some(a=>a.id===term.id)||drafts[term.id]?.trim()).length;
 return <div className="midterm-paper">
  <header className="midterm-paper-header">
   <div className="midterm-paper-kicker"><span>Midterm Practice</span><span>By Jenny Cha</span></div>
   <div className="midterm-paper-title"><div><p>네트워크 보안</p><h2>중간고사 대비 문제지</h2></div><div className="midterm-paper-grade" aria-label={complete?`100점 만점에 ${correct*10}점`:"채점 전"}><strong>{complete?correct*10:"—"}</strong><span>/ 100점</span></div></div>
   <div className="midterm-paper-meta"><span>{mode==="write"?"단답형":"객관식"} · 총 10문항 · 각 10점</span><span>답안 작성 {filled} / 10</span></div>
   <p className="midterm-paper-instructions">설명을 읽고 알맞은 키워드를 {mode==="write"?"쓰세요":"고르세요"}. 문제별로 정답을 확인하거나, 모두 푼 뒤 한꺼번에 채점할 수 있어요.</p>
  </header>
  <div className="midterm-paper-questions">
   {deck.map(({term,options},index)=>{
    const answer=answers.find(a=>a.id===term.id);
    return <article className="midterm-paper-item" key={term.id} aria-labelledby={`paper-question-${term.id}`}>
     <div className="midterm-paper-number"><span>No {String(index+1).padStart(2,"0")}</span><span>{answer?(answer.correct?"정답 · 10점":"오답 · 0점"):"10점"}</span></div>
     <h3 id={`paper-question-${term.id}`}>{term.description}</h3>
     {mode==="write"?<label className="midterm-paper-input"><span>답</span><input aria-label={`${index+1}번 답안`} name={`paper-answer-${term.id}`} autoComplete="off" maxLength={200} placeholder="키워드를 쓰세요" value={drafts[term.id]||""} readOnly={!!answer} onChange={e=>onChange(term.id,e.target.value)}/></label>:
      <div className="midterm-options midterm-paper-options" role="group" aria-label={`${index+1}번 보기`}>{options.map((option,i)=><button type="button" key={option.id} disabled={!!answer} aria-pressed={drafts[term.id]===option.keyword} className={answer?(option.id===term.id?"answer-correct":drafts[term.id]===option.keyword?"answer-wrong":""):""} onClick={()=>onChange(term.id,option.keyword)}><span>{i+1}</span>{option.keyword}{answer&&option.id===term.id&&<Check size={15} aria-label="정답"/>}</button>)}</div>}
     {answer?<div className={`midterm-feedback ${answer.correct?"is-correct":"is-wrong"}`} role="status"><strong>{answer.correct?"정답이에요!":"오답이에요. 다시 확인해 보세요."}</strong><p className="midterm-feedback-answer">정답: {term.keyword}</p>{!answer.correct&&<p>내 답: {answer.answer||"미입력"}</p>}<p>{term.description}</p></div>:
      <div className="midterm-paper-check"><button type="button" onClick={()=>onGrade(term.id)} aria-label={`${index+1}번 ${drafts[term.id]?.trim()?"정답 확인":"모르겠어요"}`}>{drafts[term.id]?.trim()?<><Check size={15}/>정답 확인</>:"모르겠어요"}</button></div>}
    </article>;
   })}
  </div>
  <footer className="midterm-paper-footer">
   {complete?<>
    {correct===deck.length&&<PerfectCelebration/>}
    <div className="midterm-paper-summary" role="status"><h3>복습 완료!</h3><p>10문제 중 <strong>{correct}문제 정답</strong> · {correct*10}점</p></div>
    <div className="midterm-result-actions">{correct<deck.length&&<button className="midterm-primary" onClick={onReview}>오답 암기 확인</button>}<button onClick={onRestart}><RotateCcw size={16}/>새 테스트 준비</button></div>
   </>:<><p>채점 완료 {answers.length} / 10 · 미입력 답안은 오답으로 처리돼요.</p><button className="midterm-primary" onClick={()=>onGrade()}><ClipboardCheck size={18}/>전체 답안 채점하기</button></>}
  </footer>
 </div>;
}
