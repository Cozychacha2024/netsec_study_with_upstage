# 보안노트

네트워크 보안 용어를 복습하는 모바일 대응 학습 사이트입니다.

## PWA 설치와 오프라인 학습

- Vercel에 재배포하면 HTTPS 주소에서 브라우저가 제공하는 설치 기능으로 PWA를 설치할 수 있습니다. 아이폰·아이패드에서는 공유 메뉴 → ‘홈 화면에 추가’를 사용합니다. 사이트 자체 설치 홍보 영역은 표시하지 않으며 브라우저의 설치 이벤트를 가로채지 않습니다.
- 첫 온라인 방문에서 오프라인 자료 저장이 완료되면 용어 학습, 별표, 게임, 기초 사전, PDF 출력 화면을 오프라인에서도 열 수 있습니다. 보안냥이와 관리자 인증은 인터넷이 필요합니다. 대화 및 API 응답은 서비스 워커에 저장하지 않습니다.
- 별표·복습·추가 용어는 기존 브라우저 저장소를 사용합니다. 기기·브라우저 간 동기화는 없으며, 설치 방식에 따라 앱과 브라우저의 저장 공간이 분리될 수 있습니다. 브라우저 데이터 삭제나 저장 공간 정리로 오프라인 자료가 없어지면 다시 온라인으로 방문해야 합니다.
- 업데이트가 준비되면 ‘새로고침’ 버튼이 나타납니다. 누르기 전까지 진행 중인 게임과 대화 화면을 강제로 새로고침하지 않습니다. 저장된 별표와 복습 기록은 새 버전에서도 유지합니다.
- `npm run build:vercel`은 Next.js 빌드 후 `scripts/build-pwa.mjs`로 해당 빌드의 오프라인 목록을 생성합니다. 생성된 `public/pwa-precache.js`는 Git에서 제외합니다. Vercel의 빌드 명령을 `next build`만으로 바꾸면 이 단계가 누락됩니다.
- 개발 서버에서는 서비스 워커를 등록하지 않습니다. PWA를 로컬에서 검증하려면 `npm run build:vercel` 후 `node node_modules/next/dist/bin/next start -p 5174`로 프로덕션 서버를 실행하세요. localhost는 HTTPS 없이도 테스트할 수 있습니다.

구현 기준: [Next.js PWA 가이드](https://nextjs.org/docs/app/guides/progressive-web-apps), [MDN 설치 요건](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

## 사용

- 용어 복습: 원본과 보충 정의를 구분하고 뜻 가리기, 복습 완료를 지원합니다.
- 별표 노트: 헷갈리는 용어만 모아 봅니다.
- 자동 책갈피: 용어 학습에서 선택하거나 이전·다음으로 이동한 위치를 저장합니다. 다른 메뉴를 다녀오거나 새로고침하면 같은 용어에서 이어집니다. 별표 메뉴의 탐색 위치와는 별도로 보관하며 현재 브라우저에서만 유지됩니다. 저장 기록을 읽지 못하면 자동 저장을 중단해 기존 기록을 보존합니다.
- 암기 게임: 객관식과 직접 입력, 최대 10문제, 별표 범위를 지원합니다.
- 보안냥이: Upstage Solar 채팅입니다. `.env.local`의 서버 환경 변수 UPSTAGE_API_KEY로만 연결합니다. 서버 변수 UPSTAGE_MODEL의 기본값은 solar-pro3입니다. 브라우저에는 키 입력창이 없으며 키를 전달하지 않습니다.
- 기초 개념: 과제와 별도인 50개 개념과 RFC/NIST 출처입니다.
- PDF: 원본 문서의 107개를 즉시 다운로드합니다. 추가한 용어까지 포함하려면 현재 용어 PDF 저장에서 브라우저의 PDF로 저장을 선택합니다.

## 원본 보존

app/terms.json의 original 필드는 제공된 DOCX의 [원본] 라벨 뒤 문구를 보관합니다. 라벨만 제거했으며 표현, 오타, 문장 및 문장 내 줄바꿈을 수정하지 않습니다. 현재 용어는 107개이며 번호는 1~107로 연속됩니다. supplement는 PDF 출력에 사용하지 않습니다. 기초 개념과 AI 설명은 원본과 별도로 다룹니다.

번호 정정 이전의 99~108번은 98~107번으로 변경되었습니다. `restoreSaved`는 기존 별표와 복습 기록을 해당 단어의 새 ID로 변환하고 `numberingVersion: 2`를 저장해 중복 변환을 막습니다. 직접 추가한 용어는 별도 내부 ID를 사용하며, 화면에는 전체 용어 순서에 따른 연속 번호를 표시합니다. `node scripts/test-numbering.mjs`로 저장 기록 변환을 검증할 수 있습니다. 원본 가져오기 스크립트는 문서와 데이터의 번호가 연속인지 검사합니다.

새 용어와 별표, 복습 기록은 현재 브라우저 localStorage에 저장됩니다. 기기 사이에는 자동 동기화되지 않습니다. 원본 문서를 갱신하면 terms.json과 배포용 PDF를 함께 갱신해야 합니다.

## 개발

npm run dev
npm run build

Windows 환경에서 npm 셸 실행이 실패하면 node scripts/run-framework.mjs dev 또는 build로 동일한 프레임워크 작업을 실행할 수 있습니다.

## 검증

TypeScript 검사와 실제 브라우저에서 별표 저장, 두 게임 채점, 용어 추가, 원본 전용 출력, 모바일 화면을 확인했습니다. PDF의 전체 원본 뜻을 텍스트 대조하고 모든 페이지를 렌더링하여 점검했습니다. 실제 Upstage 응답은 유효한 API 키가 없어 검증하지 않았습니다. WebMCP는 기능 감지 후 등록하며, 지원하는 브라우저 컨텍스트가 없어 네이티브 호출 검증은 수행하지 못했습니다.

## Vercel 배포

### 보안냥이 대화 기록

Supabase SQL Editor에서 만든 `boannyang_conversations`와 `boannyang_messages` 테이블을 사용합니다. 서버 환경 변수 `SUPABASE_URL`, `SUPABASE_SECRET_KEY`를 등록합니다. URL은 기존 `NEXT_PUBLIC_SUPABASE_URL`도 지원하며, 예전 서비스 역할 키는 `SUPABASE_SERVICE_ROLE_KEY`로 등록할 수 있습니다. Publishable key는 기존 서버 전용 테이블에 기록할 수 없습니다. Secret key는 브라우저로 전달하지 않습니다.

`CHAT_SITE_ID`는 두 Vercel 프로젝트를 구분하는 선택 항목입니다. 미설정 시 요청 사이트의 호스트명을 사용합니다. 답변 생성이 성공하면 마지막 질문과 실제 생성한 답변만 저장하고, 이어지는 질문은 서버가 서명한 대화 토큰으로 같은 대화방에 묶습니다. 새로고침으로 화면 대화가 초기화되면 새 대화방이 시작됩니다. 방문자 로그인과 대화 조회 API는 없습니다. 관리자는 Supabase Table Editor에서 메시지를 `conversation_id`, `position` 순으로 확인합니다.

저장은 응답 반환 전에 최대 8초 동안 시도하며, 실패하더라도 생성된 답변은 전달합니다. Vercel Logs에서 `[chat-log]`를 검색하세요. `missing_config`는 환경 변수 누락, `wrong_key_type`은 Publishable key 오등록, `http_401`/`http_403`은 키·권한 문제, `http_404`는 테이블·API 경로 문제입니다. 원문 대화나 키는 서버 로그에 출력하지 않습니다. Upstage 호출 자체가 실패한 질문은 저장하지 않습니다.

환경 변수와 코드 변경 후 반드시 재배포해야 합니다. 이전 대화는 소급 저장되지 않습니다.

프로젝트 루트는 이 package.json이 있는 폴더로 설정합니다(저장소에 site 폴더가 있으면 Root Directory는 site). vercel.json은 Next.js와 build:vercel 빌드, .next 출력을 지정합니다. 기존 로컬 미리보기는 npm run dev를 사용합니다.

Vercel Settings → Environment Variables에 UPSTAGE_API_KEY, UPSTAGE_MODEL(선택, 기본 solar-pro3), ADMIN_PASSWORD를 등록하고 재배포합니다. .env.local은 Git에서 제외되므로 자동 업로드되지 않습니다. 비밀값에 NEXT_PUBLIC_ 접두사를 붙이지 않습니다.
