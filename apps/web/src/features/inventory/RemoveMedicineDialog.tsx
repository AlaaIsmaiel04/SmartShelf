import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../preferences/LanguageProvider';

export function RemoveMedicineDialog({
  name,
  batchCount,
  pending,
  allowed,
  error,
  returnFocus,
  onConfirm,
  onCancel,
}: {
  name: string;
  batchCount: number;
  pending: boolean;
  allowed: boolean;
  error: string;
  returnFocus: HTMLButtonElement;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t, translateMessage } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const titleId = useId(),
    descriptionId = useId();
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    cancel.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (returnFocus.isConnected && !returnFocus.disabled) returnFocus.focus();
    };
  }, [returnFocus]);
  return createPortal(
    <dialog
      ref={dialog}
      className="medicine-remove-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={pending}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled)',
          ),
        );
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (!first) {
          event.preventDefault();
          event.currentTarget.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === event.currentTarget)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      onClick={(event) => {
        if (pending || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onCancel();
      }}
    >
      <div className="medicine-remove-heading">
        <span className="medicine-remove-symbol">
          <Trash2 size={22} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h2 id={titleId}>{t('Remove medicine')}</h2>
      </div>
      <p className="medicine-remove-name">
        <bdi dir="auto">{name}</bdi>
      </p>
      <p id={descriptionId}>
        {t(
          'This will permanently remove this medicine and all its batches. This cannot be undone.',
        )}
      </p>
      <p className="medicine-remove-batches">
        {t('Batch details ({count})', { count: batchCount })}
      </p>
      {error && (
        <p className="medicine-remove-error" role="alert">
          {translateMessage(error)}
        </p>
      )}
      {pending && (
        <p className="medicine-remove-status" role="status">
          {t('Removing medicine…')}
        </p>
      )}
      <div className="medicine-remove-actions">
        <button
          ref={cancel}
          type="button"
          disabled={pending}
          onClick={onCancel}
        >
          {t('Cancel')}
        </button>
        <button
          className="medicine-remove-confirm"
          type="button"
          disabled={pending || !allowed}
          onClick={onConfirm}
        >
          <Trash2 size={17} strokeWidth={1.8} aria-hidden="true" />
          {t(pending ? 'Removing medicine…' : 'Remove medicine')}
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
