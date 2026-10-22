# 현황

2026-10-22. 다음 작업은 기존 클라우드 환경에서 `fix/production-listening-room` 브랜치를 이어간다. 기준은 복구 브랜치 `recovery/production-2026-10-22`의 `94e851b`이며 운영 감상실의 38개 소스 파일이 원래 배포와 일치한다. 오래된 `develop`이나 `fix/listening-room-playback` 브랜치로 운영을 덮어쓰지 않는다.

원본 맥북 checkout은 미커밋 변경이 없었으며 수정하지 않았다. 별도 worktree와 3122 포트에서 작업했다. 기존 Vercel `television` 프로젝트와 https://ml3yp.vercel.app 배포 경로를 사용한다. 새 계정·키·권한·공개 범위 변경은 없다.

# 변경

- 곡 변경 때 YouTube iframe을 파괴/재생성하던 동작을 없애고, 기존 iframe의 cue 완료 후 사용자의 재생 의도를 이어간다. 실패 후 명시적 다시 시도만 iframe을 새로 만든다.
- 곡 변경 때 플레이어 참조를 지우지 않아 다음 곡에서도 일시정지·볼륨 제어가 유지된다.
- 검색 제목·채널명을 HTML 파서 없이 문자열로 디코딩하고 React 텍스트로 표시한다. 잘못된 유니코드 엔티티도 안전하게 처리한다.
- 감상실 3D, 가구 배치, 조명, 시각 디자인은 유지했다. 3D는 실제 화면에서 정상 확인했다. 접근성 트리의 Canvas 대체 텍스트를 3D 오류로 판정하면 안 된다.

검증: 타입 검사, 전체 lint, 단위 테스트 17개 통과. 실제 React 훅으로 자연 종료→다음 곡 cue→재생, 다음 곡 일시정지, 실패 후 재시도를 검증했다. E2E 회귀 시나리오도 추가했으며 브라우저는 이 맥북에서 Chrome으로 직접 확인한다. Playwright 설정은 기본 3122 포트이며 다른 작업의 기존 서버를 재사용하지 않는다.

원래 운영의 실제 `lofi jazz` 검색과 두 영상 직접 재생은 성공했다. 두 영상의 마지막 수 초에서 자연 종료를 기다렸을 때 다음 제목은 표시되지만 새 iframe이 about:blank 상태로 남아 12초 연결 시간초과가 두 번 발생했다. [수정 전 증빙](evidence/production-autoplay-before.jpg).

이 맥북의 Next build/dev는 Node25 및 별도 Node24에서 시작 단계에 멈췄다. 원격 Vercel 빌드와 수정 후 운영 검증 결과는 배포 완료 후 이 문서에 기록한다. 단위 테스트는 브라우저/실제 음원 검증을 대신하지 않는다.

# 다음 일

- 배포 후 운영 검색·직접 재생·자연 종료 연속 재생 및 기존 감상실 유지 확인.
- iPhone/Android/Safari 실제 기기와 스피커 청취는 미검증.
- Meshy 가구는 다운로드된 원본이 없고 기존 로그인 본인확인이 대기 상태라 적용 보류. 신규 생성·지출·로그인 우회 없이 기존 자산 다운로드와 원본·라이선스·크기·렌더 검수 후 검토한다.

클라우드에서 Node24와 저장소의 Yarn을 사용한다. 비밀값은 기존 환경변수 `YOUTUBE_API_KEY`로 제공하며 출력/커밋하지 않는다. 로컬 절대 경로나 로컬 전용 자산이 필요하지 않다.

```sh
git fetch origin
git switch fix/production-listening-room
node .yarn/releases/yarn-4.3.1.cjs install --immutable
npm run typecheck
npm test
npm run lint
npm run build
npm run dev -- --hostname 127.0.0.1 --port 3122
# 독립 자동 브라우저 테스트 환경에서:
PORT=3122 npm run test:e2e
```
