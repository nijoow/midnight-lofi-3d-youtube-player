import type { Preferences } from '../../_lib/room';
import type { useSleepTimer } from '../../_hooks/useSleepTimer';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
export function RoomSettings({
  open,
  onClose,
  preferences,
  onChange,
  sleep,
}: {
  open: boolean;
  onClose: () => void;
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  sleep: ReturnType<typeof useSleepTimer>;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="설정">
      <div className="settings-body">
        <div className="setting-section">
          <h3>화면 모드</h3>
          <p>2D 보기는 그래픽 부하가 적어요.</p>
          <div className="segmented-control">
            {(['3d', '2d'] as const).map(mode => (
              <button
                key={mode}
                aria-pressed={preferences.mode === mode}
                onClick={() => onChange({ mode })}
              >
                {mode.toUpperCase()} 보기
              </button>
            ))}
          </div>
        </div>
        <div className="setting-section">
          <h3>그래픽 품질</h3>
          <p>절전 모드는 그림자와 움직임을 줄여요.</p>
          <div className="segmented-control">
            <button
              aria-pressed={preferences.quality === 'balanced'}
              onClick={() => onChange({ quality: 'balanced' })}
            >
              기본 품질
            </button>
            <button
              aria-pressed={preferences.quality === 'low'}
              onClick={() => onChange({ quality: 'low' })}
            >
              절전 모드
            </button>
          </div>
        </div>
        <label className="setting-toggle">
          <span>
            <strong>움직임 줄이기</strong>
            <small>
              공기 중 입자와 화면 움직임을 멈춰요. 기기 설정도 반영해요.
            </small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={preferences.reducedMotion}
            onChange={e => onChange({ reducedMotion: e.target.checked })}
          />
        </label>
        <label className="setting-toggle">
          <span>
            <strong>거실 스탠드</strong>
            <small>집중 타이머가 실행 중이면 자동으로 켜져요.</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={preferences.lampOn}
            onChange={e => onChange({ lampOn: e.target.checked })}
          />
        </label>
        <div className="setting-section">
          <h3>
            <Icon name="moon" size={18} /> 취침 예약
          </h3>
          <p>정해진 시간이 지나면 음악을 멈춰요.</p>
          <label className="sr-only" htmlFor="sleep-duration">
            음악을 멈출 시간
          </label>
          <select
            id="sleep-duration"
            value=""
            onChange={e => sleep.schedule(Number(e.target.value))}
          >
            <option value="" disabled>
              예약 시간 선택
            </option>
            <option value="30">30분 뒤</option>
            <option value="60">1시간 뒤</option>
            <option value="90">1시간 30분 뒤</option>
          </select>
          {sleep.deadline && (
            <div className="sleep-status" role="status">
              {sleep.minutes}분 뒤 음악이 멈춰요.
              <button className="text-button" onClick={() => sleep.schedule(0)}>
                예약 취소
              </button>
            </div>
          )}
        </div>
        <p className="settings-footnote">
          음악과 방 설정은 이 브라우저에 저장돼요. 타이머와 취침 예약은 현재
          탭에서 유지돼요.
        </p>
      </div>
    </Dialog>
  );
}
