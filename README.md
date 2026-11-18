# Midnight Lofi

3D 거실 속 빈티지 TV로 YouTube 음악을 감상할 수 있는 로파이 웹 플레이어입니다. 재생 목록 관리와 뽀모도로 집중 타이머, 취침 예약 기능을 제공합니다.

## 주요 기능

- 빈티지 TV 및 거실 3D 모델과 반투명 재생 UI
- 비 오는 새벽, 조용한 밤, 노을 지는 방 분위기 전환
- TV 화면 재생 및 거실 조명 조절
- 기본, 거실, TV 정면 카메라 전환 및 드래그 회전
- 추천 음악, YouTube 검색, 영상 링크 직접 추가
- 재생 목록 순서 변경 및 삭제, 이전/다음 곡, 볼륨, 음소거, 반복 재생
- 25분, 50분, 자유 모드 집중 타이머 및 5분 휴식 안내
- 30분, 60분, 90분 취침 예약
- 설정 및 음악 목록 복원 (재방문 시 자동 재생 비활성화)
- 절전 모드, 움직임 줄이기, CSS 기반 2D TV 보기 지원
- WebGL 오류 발생 시에도 음악과 타이머 유지

## 실행

Node.js 22 이상과 저장소에 포함된 Yarn 4.3.1을 사용합니다.

```sh
node .yarn/releases/yarn-4.3.1.cjs install --immutable
cp .env.example .env.local
node .yarn/releases/yarn-4.3.1.cjs dev
```

- `.env.local`의 `YOUTUBE_API_KEY`에는 YouTube Data API v3가 활성화된 키를 입력합니다.
- API 키는 서버 검색 라우트에서만 사용하며, 키 없이도 추천 음악, 영상 링크 추가, 집중 타이머는 동작합니다.

## 테스트와 빌드

```sh
node .yarn/releases/yarn-4.3.1.cjs lint
node .yarn/releases/yarn-4.3.1.cjs test
node .yarn/releases/yarn-4.3.1.cjs build
node .yarn/releases/yarn-4.3.1.cjs typecheck

node .yarn/releases/yarn-4.3.1.cjs playwright install chromium
node .yarn/releases/yarn-4.3.1.cjs test:e2e
```

브라우저 테스트는 기본 포트 3122의 독립 개발 서버를 사용하며(`PORT`로 변경 가능), 기존 Chromium을 사용하려면 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`를 지정하면 됩니다.

## 구조와 렌더링

- `src/app/page.tsx`: 메인 화면 및 기능 연결
- `src/app/_components/three/`: TV, 거실, 카메라, 2D 화면
- `src/app/_components/ui/`: 음악 패널, 플레이어, 타이머, 설정
- `src/app/_components/video/`: YouTube 임베드 지연 로딩
- `src/app/_hooks/`: 재생, 검색, 저장, 타이머 훅
- `src/app/_lib/`: 데이터 검증, 목록, 시간 계산, 검색 서버 유틸리티
- `src/app/api/youtube/search/route.ts`: 서버 전용 검색 API

카메라 전환이나 3D/2D 전환 시 iframe이 재생성되어 음악이 끊기는 문제를 막기 위해, `PlayerScreen`을 WebGL 캔버스 밖에 유지하고 CSS 행렬로 TV 화면 위치에 맞춰 배치했습니다. 균형 모드에서는 그림자 광원과 해상도를 제한하고, 절전 모드에서는 실시간 그림자와 지속 애니메이션을 비활성화해 부하를 줄입니다.

## 저장과 운영

- `localStorage`(`midnight-room:v1`): 방 설정과 최대 200개 영상 목록 저장
- `sessionStorage`: 현재 탭의 집중 타이머 및 취침 예약 상태 유지
- 검색 API: 입력 검증, 임베드 필터, 8초 타임아웃, 5분 캐시(최대 100개), 동일 요청 병합 및 분당 20회 요청 제한 적용
