"use client";
import {useEffect,useState} from "react";
import {Download,Printer,ChevronLeft} from "lucide-react";
import initial from "../terms.json";
import type {Term} from "../page";
import "./print.css";
export default function Export(){const [terms,setTerms]=useState<Term[]>(initial);const [error,setError]=useState("");useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("security-notebook-v1")||"null");setTerms([...initial,...(saved?.added||[]).filter((t:Term)=>t.id>53&&typeof t.term==="string"&&typeof t.original==="string")])}catch{setError("이 브라우저에서 추가 용어를 불러오지 못했습니다.")}},[]);return <div className="export-page"><div className="export-toolbar"><a href="/"><ChevronLeft size={17}/> 용어집으로</a><div><a className="export-button" href="/network-security-original.pdf" download="네트워크 보안 용어집 원본 53개.pdf"><Download size={17}/> 문서 원본 53개 다운로드</a><button className="primary" onClick={()=>window.print()}><Printer size={17}/> 현재 {terms.length}개 PDF 저장</button></div><p>‘PDF로 저장’을 선택하세요. 원본 뜻만 포함하며, 보충 정의와 기초 개념은 제외합니다.</p>{error&&<p role="alert">{error}</p>}</div><article className="print-document"><h1>네트워크 보안 용어집</h1><table><thead><tr><th>용어</th><th>뜻</th></tr></thead><tbody>{terms.map(t=><tr key={t.id}><td>{t.term}</td><td>{t.original}</td></tr>)}</tbody></table></article></div>}
