import { useCallback, useEffect, useRef, useState } from "react";
import StarField from "./StarField";
import { INTRO } from "../constants/intro";

const FADE_IN = 600;
const SEQUENCE_STEP = 500;

interface OpeningProps {
  onOpen: () => void;
}

type OpeningPhase = "stars" | "envelope" | "flap" | "letter" | "message" | "done";

export default function Opening({ onOpen }: OpeningProps) {
  const [phase, setPhase] = useState<OpeningPhase>("stars");
  const [reducedMotion, setReducedMotion] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const disposedRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const hasOpenedRef = useRef(false);

  // OSのモーション設定を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  // アンマウント時の非同期処理を停止
  useEffect(() => {
    disposedRef.current = false;

    return () => {
      disposedRef.current = true;

      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter((current) => current !== timer);

      if (disposedRef.current || isTransitioningRef.current || hasOpenedRef.current) return;

      callback();
    }, delay);

    timersRef.current.push(timer);
  }, []);

  const SESSION_STORAGE_KEY = "disney-invitation:v1:opening-done";

  const saveOpeningDone = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
    } catch {
      /* sessionStorage アクセス失敗時も通常のオープニング操作を継続 */
    }
  }, []);

  // 本編への遷移は必ず一度だけ実行
  const proceed = useCallback(() => {
    if (disposedRef.current || isTransitioningRef.current || hasOpenedRef.current) return;

    hasOpenedRef.current = true;
    isTransitioningRef.current = true;
    clearTimers();
    setPhase("done");

    // 通常のボタンクリックとスキップの両方で共通して完了フラグを保存
    saveOpeningDone();

    onOpen();
  }, [clearTimers, onOpen, saveOpeningDone]);

  const handleSkip = useCallback(() => {
    proceed();
  }, [proceed]);

  const handleOpen = useCallback(() => {
    proceed();
  }, [proceed]);

  // 同一タブ内の再訪時に sessionStorage フラグがあれば演出を省略して本編へ遷移
  useEffect(() => {
    let isShortMode = false;
    try {
      isShortMode = window.sessionStorage.getItem(SESSION_STORAGE_KEY) === "1";
    } catch {
      /* sessionStorage アクセス失敗時は通常モードとして扱う */
    }

    if (isShortMode) {
      proceed();
    }
  }, [proceed]);

  // 開封演出
  useEffect(() => {
    if (reducedMotion) {
      setPhase("message");
      return;
    }

    const sequence = [
      { phase: "envelope" as const, delay: FADE_IN },
      { phase: "flap" as const, delay: FADE_IN + SEQUENCE_STEP },
      { phase: "letter" as const, delay: FADE_IN + SEQUENCE_STEP * 2 },
      { phase: "message" as const, delay: FADE_IN + SEQUENCE_STEP * 3 },
    ];

    sequence.forEach(({ phase: nextPhase, delay }) => {
      schedule(() => {
        setPhase(nextPhase);
      }, delay);
    });

    return clearTimers;
  }, [reducedMotion, schedule, clearTimers]);

  const isVisible = (minimumPhase: OpeningPhase) => {
    const order: OpeningPhase[] = ["stars", "envelope", "flap", "letter", "message", "done"];
    return order.indexOf(phase) >= order.indexOf(minimumPhase);
  };

  const transitionStyle = (visible: boolean, translateY = 14): React.CSSProperties => {
    if (reducedMotion) {
      return {
        opacity: visible ? 1 : 0,
        transform: "none",
        transition: "none",
      };
    }
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : `translateY(${translateY}px)`,
      transition: "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
    };
  };

  if (phase === "done") return null;

  const isFlapOpen = phase === "flap" || phase === "letter" || phase === "message";
  const isLetterOut = phase === "letter" || phase === "message";

  return (
    <>
      <StarField />

      <main className="opening layer-content">
        {/* Skipは開封演出中いつでも操作可能 */}
        <button
          type="button"
          className="opening__skip"
          onClick={handleSkip}
          disabled={isTransitioningRef.current}
        >
          {INTRO.skipLabel}
        </button>

        <div className="opening__content">
          {/* 封筒ステージ */}
          <div
            className="opening__stage"
            aria-hidden="true"
            style={transitionStyle(isVisible("envelope"), 24)}
          >
            <div className="opening__envelope">
              {/* 封筒の背景・背面 */}
              <div className="opening__envelope-back" />

              {/* 便箋 */}
              <div
                className="opening__letter"
                style={{
                  bottom: isLetterOut ? "36%" : "6%",
                  transform: isLetterOut ? "translateY(-8px)" : "translateY(0)",
                  transition: reducedMotion
                    ? "none"
                    : "bottom 850ms cubic-bezier(0.22, 1, 0.36, 1), transform 850ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div className="opening__letter-border">
                  <span className="opening__letter-text">A Special Invitation</span>
                  <div className="opening__letter-line" />
                </div>
              </div>

              {/* 封筒の前面ポケット */}
              <div className="opening__envelope-pocket" />

              {/* フラップ（蓋） */}
              <div
                className="opening__envelope-flap"
                style={{
                  transform: isFlapOpen ? "rotateX(180deg)" : "rotateX(0deg)",
                  transition: reducedMotion
                    ? "none"
                    : "transform 750ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              {/* 封蝋（シーリングスタンプ） */}
              <div
                className="opening__seal"
                style={{
                  opacity: isFlapOpen ? 0 : 1,
                  transform: isFlapOpen
                    ? "translate(-50%, -50%) scale(0.7)"
                    : "translate(-50%, -50%) scale(1)",
                  transition: reducedMotion
                    ? "none"
                    : "opacity 300ms ease, transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
                  pointerEvents: "none",
                }}
              >
                <div className="opening__seal-emblem">
                  <span className="opening__seal-initial">D</span>
                </div>
              </div>
            </div>
          </div>

          {/* オーナメント */}
          <div
            className="ornament opening__ornament"
            style={transitionStyle(isVisible("envelope"), 8)}
            aria-hidden="true"
          >
            <span className="ornament__gem" />
          </div>

          {/* 英字ラベル */}
          <p
            className="latin-label opening__label"
            style={transitionStyle(isVisible("letter"), 10)}
          >
            {INTRO.label}
          </p>

          {/* 日本語タイトル */}
          <h1
            className="opening__title gold-text"
            style={transitionStyle(isVisible("message"), 12)}
          >
            {INTRO.title}
          </h1>

          {/* メッセージとCTA */}
          <div
            className="opening__message-area"
            style={transitionStyle(isVisible("message"), 16)}
            aria-live="polite"
          >
            {phase === "message" && (
              <>
                <p className="opening__lead">{INTRO.lead}</p>

                <button
                  type="button"
                  className="btn btn--gold opening__cta"
                  onClick={handleOpen}
                >
                  {INTRO.buttonLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
