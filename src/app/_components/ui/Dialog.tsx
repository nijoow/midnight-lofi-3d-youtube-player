'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
export function Dialog({
  open,
  onClose,
  title,
  eyebrow,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="side-dialog"
      aria-label={title}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        )
          onClose();
      }}
    >
      {open && (
        <>
          <header className="dialog-header">
            <div>
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              <h2>{title}</h2>
            </div>
            <button
              className="icon-button"
              onClick={onClose}
              aria-label="패널 닫기"
            >
              <Icon name="close" />
            </button>
          </header>
          {children}
        </>
      )}
    </dialog>
  );
}
