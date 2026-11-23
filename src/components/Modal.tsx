import { useEffect } from "react";

function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `calc(${window.innerWidth - document.documentElement.clientWidth}px)`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isLocked]);
}

export default function Modal({
  isOpen,
  onClose,
  title,
  content,
  confirmLabel,
  confirmAction,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: React.ReactNode;
  confirmLabel?: string;
  confirmAction?: () => void;
}) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOverlayClick = () => {
      onClose();
    };

    const overlay = document.querySelector(".modal-overlay") as HTMLElement;
    if (overlay) {
      overlay.addEventListener("click", handleOverlayClick);
    }
    return () => {
      const o = document.querySelector(".modal-overlay") as HTMLElement;
      if (o) {
        o.removeEventListener("click", handleOverlayClick);
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={0}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close-btn"
          aria-label="モーダルを閉じる"
          onClick={onClose}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {title && (
          <h2 id="modal-title" className="modal__title font-display gold-text">
            {title}
          </h2>
        )}

        <div className="modal__content">{content}</div>

        {confirmLabel && confirmAction && (
          <div className="modal__actions">
            <button
              type="button"
              className="modal__btn modal__btn--cancel"
              onClick={onClose}
            >
              {confirmLabel || "キャンセル"}
            </button>
            {confirmAction && (
              <button
                type="button"
                className="modal__btn modal__btn--primary"
                onClick={confirmAction}
              >
                {confirmLabel || "OK"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}