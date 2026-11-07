# 보안노트 · Network Security Study Companion

네트워크 보안 용어를 스스로 복습하고, AI 학습 도우미와 개념을 확인할 수 있는 모바일 우선 학습 웹 애플리케이션입니다. 단순한 용어 목록을 넘어 반복 학습, 암기 점검, 시험 대비, AI 질의응답을 하나의 흐름으로 연결했습니다.

## 주요 기능

- **용어 학습** — 107개 과제 용어의 원문 뜻을 보존하고, 뜻 가리기·별표·복습 완료·자동 책갈피를 제공합니다.
- **암기 게임** — 객관식과 직접 입력 방식으로 최대 10문제를 풀고 즉시 정답을 확인합니다.
- **중간고사 대비** — 제공된 54개 범위에서 중복 없이 10문제를 출제합니다. 시험지형과 한 문제씩 풀이를 선택할 수 있으며, 개별·전체 채점과 오답 복습을 지원합니다.
- **기초 개념 사전** — 과제 용어와 별도로 학습에 필요한 네트워크 기초 개념을 탐색합니다.
- **보안냥이 AI** — Upstage Solar API 기반 학습 챗봇입니다. 네트워크 보안 범위 안에서 존댓말로 답하고, 불확실한 정보는 명확히 구분하도록 시스템 지침을 구성했습니다.
- **PDF 출력** — 과제 원문 뜻만 담은 표 형식 PDF를 내려받거나 인쇄할 수 있습니다.
- **PWA** — 설치 가능한 웹 앱으로 구성했으며, 핵심 학습 자료는 첫 방문 후 오프라인에서도 이용할 수 있습니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| UI | CSS, Lucide Icons |
| AI | Upstage Solar Chat Completions API |
| Data | Supabase REST API |
| PDF | pdf-lib |
| PWA | Web App Manifest, Service Worker, Cache Storage |
| Deploy | Vercel |

## 설계 포인트

### 원문 데이터와 AI 설명의 분리

과제 원문의 뜻은 별도 데이터 필드로 관리하고, 보충 정의·기초 사전·AI 답변과 분리했습니다. PDF에는 원문 뜻만 사용해 과제 데이터가 보충 설명으로 바뀌지 않도록 했습니다.

### 안전한 AI·대화 기록 처리

Upstage API 키와 Supabase Secret key는 서버 환경 변수로만 사용합니다. 브라우저에는 비밀 키를 전달하지 않으며, 대화 기록은 서버가 Supabase에 저장합니다. 방문자에게 대화 조회 API를 제공하지 않고, AI 응답에는 안전한 학습 목적과 정확성 우선 원칙을 적용했습니다.

### 학습 흐름 보존

별표, 복습 상태, 자동 책갈피, 중간고사 암기 기록은 브라우저 저장소에 분리해 보관합니다. 사용자가 다른 메뉴를 다녀와도 학습 위치와 진행 중인 문제를 유지합니다.

### 오프라인 우선 PWA

서비스 워커는 정적 학습 자료만 캐시하며, 채팅·관리자 요청·외부 API 응답은 캐시하지 않습니다. 새 버전이 준비되면 사용자가 원할 때 업데이트할 수 있어 학습 중인 화면이 갑자기 초기화되지 않습니다.

## 프로젝트 구조

```text
app/
  api/chat/          # Upstage API 호출 및 대화 저장 API
  terms.json         # 과제 용어 원문 데이터
  midterm-terms.json # 중간고사 범위 데이터
  activities.tsx     # 암기 게임·보안냥이 UI
  midterm.tsx        # 시험 대비 학습 UI
lib/
  chat-log.ts        # Supabase 대화 기록 저장
public/
  sw.js              # PWA 서비스 워커
scripts/
  build-pwa.mjs      # 배포 빌드 기반 오프라인 목록 생성
```

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

## 환경 변수

`.env.local` 파일을 만들고 아래 항목을 설정합니다. 실제 값은 저장소에 커밋하지 않습니다.

```env
UPSTAGE_API_KEY=
UPSTAGE_MODEL=solar-pro3

SUPABASE_URL=
SUPABASE_SECRET_KEY=
CHAT_SITE_ID=security-note

ADMIN_PASSWORD=
```

`SUPABASE_SECRET_KEY`와 `UPSTAGE_API_KEY`는 서버 전용 값입니다. `NEXT_PUBLIC_` 접두사를 붙이지 않아야 합니다.

## 배포

Vercel 프로젝트의 Root Directory를 이 `package.json`이 있는 폴더로 설정하고, 환경 변수를 등록한 뒤 배포합니다.

```bash
npm run build:vercel
```

이 빌드 명령은 Next.js 프로덕션 빌드 뒤 PWA 오프라인 목록을 생성합니다.

## 검증

```bash
npx tsc --noEmit
npm run build:vercel
```

별도 브라우저 테스트로 용어 복습, 암기 게임, 시험지형 채점, 모바일 레이아웃, 대화 기록 저장 흐름을 확인합니다.
