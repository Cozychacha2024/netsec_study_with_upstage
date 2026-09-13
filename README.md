# 보안노트

네트워크 보안 용어를 복습하는 모바일 대응 학습 사이트입니다.

## 사용

- 용어 복습: 원본과 보충 정의를 구분하고 뜻 가리기, 복습 완료를 지원합니다.
- 별표 노트: 헷갈리는 용어만 모아 봅니다.
- 암기 게임: 객관식과 직접 입력, 최대 10문제, 별표 범위를 지원합니다.
- 보안냥이: Upstage Solar 채팅입니다. `.env.local`의 서버 환경 변수 UPSTAGE_API_KEY로만 연결합니다. 서버 변수 UPSTAGE_MODEL의 기본값은 solar-pro3입니다. 브라우저에는 키 입력창이 없으며 키를 전달하지 않습니다.
- 기초 개념: 과제와 별도인 50개 개념과 RFC/NIST 출처입니다.
- PDF: 원본 문서의 53개는 즉시 다운로드합니다. 추가한 용어까지 포함하려면 현재 용어 PDF 저장에서 브라우저의 PDF로 저장을 선택합니다.

## 원본 보존

app/terms.json의 original 필드는 제공된 DOCX의 [원본] 라벨 뒤 문구를 보관합니다. 라벨만 제거했으며 표현, 오타, 문장 및 문장 내 줄바꿈을 수정하지 않습니다. 54번은 비어 있어 완성 항목 53개만 추출했습니다. supplement는 PDF 출력에 사용하지 않습니다. 기초 개념과 AI 설명은 원본과 별도로 다룹니다.

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
