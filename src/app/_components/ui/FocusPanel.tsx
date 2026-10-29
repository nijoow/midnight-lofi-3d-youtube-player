import { BREAK_SECONDS } from '../../_lib/timer';
import { formatTime } from '../../_lib/room';
import type { useFocusTimer } from '../../_hooks/useFocusTimer';
import { Icon } from './Icon';
export function FocusPanel({
  focus,
}: {
  focus: ReturnType<typeof useFocusTimer>;
}) {
  const { timer, remaining, toggle, selectMode, reset, notice } = focus;
  const total = timer.phase === 'break' ? BREAK_SECONDS : timer.mode * 60;
  const progress = total ? Math.min(100, (1 - remaining / total) * 100) : 0;
  return (
    <section
      className={'focus-card' + (focus.focusing ? ' is-focusing' : '')}
      aria-labelledby="focus-title"
    >
      <div className="section-heading">
        <span className="eyebrow" id="focus-title">
          <Icon name="clock" size={14} />{' '}
          {timer.phase === 'break' ? '휴식' : '집중'}
        </span>
        <span className="tiny-status">
          {timer.running ? '진행 중' : '대기'}
        </span>
      </div>
      <div className="focus-modes" aria-label="집중 시간">
        {([25, 50, 0] as const).map(mode => (
          <button
            key={mode}
            onClick={() => selectMode(mode)}
            disabled={timer.running}
            aria-pressed={timer.mode === mode}
          >
            {mode === 0 ? '자유' : mode + '분'}
          </button>
        ))}
      </div>
      <div
        className="timer-display"
        role="timer"
        aria-label={
          timer.phase === 'break'
            ? '남은 휴식 시간'
            : timer.mode
              ? '남은 집중 시간'
              : '집중한 시간'
        }
      >
        {formatTime(remaining)}
        <span>
          {timer.mode === 0 && timer.phase !== 'break'
            ? '경과 시간'
            : '남은 시간'}
        </span>
      </div>
      <div className="timer-progress" aria-hidden="true">
        <i style={{ width: progress + '%' }} />
      </div>
      <div className="focus-actions">
        <button id="focus-start" className="primary-button" onClick={toggle}>
          <Icon name={timer.running ? 'pause' : 'play'} size={15} />
          {timer.running
            ? '잠시 멈추기'
            : timer.phase === 'break'
              ? '휴식 시작'
              : '집중 시작'}
        </button>
        <button
          className="icon-button"
          onClick={reset}
          aria-label="타이머 초기화"
        >
          <Icon name="reset" size={17} />
        </button>
      </div>
      {timer.completed > 0 && (
        <p className="focus-note">이 탭에서 {timer.completed}회 완료</p>
      )}
      <p className="sr-only" role="status">
        {notice}
      </p>
    </section>
  );
}
