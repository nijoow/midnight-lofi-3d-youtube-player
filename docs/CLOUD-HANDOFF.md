# 현황

2026-10-22 맥북 작업. 다음 작업은 기존 프로젝트 클라우드 환경에서 이어간다.

- 원격 `develop`: `2df8c3c` (Next 14.2.4 / React 18). 원본 맥북 checkout `11200ca`에는 미커밋 변경이 없었으며 원본은 수정하지 않았다.
- 작업 브랜치: `fix/listening-room-playback`. 이 브랜치는 **예전 develop에 대한 수정본**이며 현재 운영 감상실 전체 소스가 아니다. 바로 운영 배포하면 최신 UI가 사라질 수 있다.
- 운영: https://ml3yp.vercel.app, Vercel 기존 `television` 프로젝트. 확인한 배포 `dpl_AAB2QECDC2kVYtF3GJgzJB1KSFf8` / READY. 운영은 `midnight-room` 0.2.0 (Next 15.5.27 / React 19.3.0)이며 `RoomScene`, `MusicLibrary`, `useYouTubePlayer`, `useRoomState` 등을 사용한다. 해당 소스는 원격 develop에 없다.
- 이번 작업에서 운영 배포·프로젝트 설정·공개 범위 변경은 하지 않았다. 새로운 외부 빌드도 시작하지 않았다.

# 변경

- 제목 3곳의 HTML 삽입을 React 텍스트 렌더링으로 변경. 엔티티는 한 번만 문자열로 해석한다.
- 검색 요청 취소 및 오래된 응답 무시, 제출한 검색어 기준으로 더 보기, 페이지 토큰 인코딩, 한글 조합 중 Enter 방지.
- 검색 API의 입력 제한·10초 타임아웃·임베드 가능한 결과 필터·비밀값 없는 오류 응답.
- 실제 YouTube 상태에 따른 재생 버튼, 최초 자동재생 금지, 중복 곡 방지, 현재 곡 삭제 시 다음 곡 선택, 마지막 곡 종료/빈 목록 정지 처리.
- 감상실 가구·조명·배치·디자인은 변경하지 않았다.

검증:

| 구분 | 결과 |
| --- | --- |
| 타입 검사 | `npm run typecheck` 통과 |
| 회귀 테스트 | `npm test`: 악성 제목 실제 SSR, 목록 삭제/종료, 검색 API 계약·실패 처리 3개 통과 |
| 수정 파일 lint | `npm run lint:player` 통과 (기존 Next core-web-vitals 규칙) |
| 실제 수정 검색 API | `npm run test:live-search`: 기존 로컬 키로 200, 결과 10개, 다음 페이지 존재 |
| 전체 lint | 원래 ESLint 구성의 누락된 `@typescript-eslint/eslint-plugin` 등 peer dependency로 차단. 대체 lint 통과를 전체 lint 통과로 간주하지 않음 |
| 전체 빌드·로컬 UI | Node 25 및 22에서 `Creating an optimized production build` 단계에 정체. 별도 임시 폴더도 동일. dev는 `Starting` 후 HTTP 15초 시간초과. 프로세스 종료했으며 성공으로 판정하지 않음 |
| 운영 Chrome | 실제 `lofi jazz` 검색 성공. `CBSlu_VMS9U`, `-R0UYHS8A_A` 직접 재생 및 진행 시간 확인 |
| 운영 연속 재생 | 두 영상의 마지막 수 초로 탐색한 뒤 자연 종료. 다음 제목으로 전환되지만 새 iframe은 `about:blank` 상태 후 연결 시간초과. 직접 다음 곡 선택은 재생됨. 재현 2회, 완전 통과 아님 |
| 운영 3D | 로딩 실패 안내 재현. 2D는 표시·재생됨. 원인 미확정 |
| 실기기 | 맥북 Chrome만 확인. iPhone/Android/Safari·실제 스피커 청취 미검증 |

[운영 연속 재생 오류 증빙](evidence/production-autoplay-timeout.jpg)

# 다음 일

1. 기존 클라우드 `ml3yp` 작업(`01a12572-89b7-72dd-916b-3712f4407027`)의 최신 감상실 소스를 Git 브랜치에 복구한다. 맥북/GitHub에는 없었고 Vercel 커넥터 소스 읽기는 트리 깊이 및 파일 3,000자 제한으로 잘렸다. 맥북 CLI와 Vercel 웹은 기존 인증이 없으며 새 토큰·권한을 만들지 않았다.
2. 최신 소스에 이 브랜치의 필요한 수정을 이식하고 `useYouTubePlayer`의 곡 종료 후 iframe 생성/연결 흐름, `RoomScene`의 3D 로딩 실패를 수정한다. 이 브랜치 전체를 운영 위에 덮어쓰지 않는다.
3. 전체 lint·build와 실제 검색·재생·자연 종료 자동 재생, 모바일을 확인한 뒤 기존 Vercel 프로젝트로 배포하고 READY와 운영 동작을 끝까지 확인한다.
4. Meshy 가구는 다운로드된 자산이 없고 앞선 Google 본인확인이 대기 상태라 적용하지 못했다. 인증된 다운로드와 원본·라이선스·크기·렌더 검수 후 별도로 적용한다. 신규 생성·지출·로그인 우회 금지.

클라우드 재현 명령 (저장소 루트):

```sh
git fetch origin
git switch fix/listening-room-playback
node .yarn/releases/yarn-4.3.1.cjs install --immutable
npm run typecheck
npm test
npm run lint:player
# 기존 환경의 YOUTUBE_API_KEY를 사용할 때만 실행 (키를 출력하거나 커밋하지 않음)
npm run test:live-search
npm run build
# 다른 작업과 독립 포트
npm run dev -- --hostname 127.0.0.1 --port 3122
```

비밀값 및 로컬 절대 경로는 필요하지 않다. `.env.local`은 커밋 제외이며 클라우드 기존 환경변수를 사용한다. 이 문서와 증빙은 저장소 안에서 함께 이동한다.
