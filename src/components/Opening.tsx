import { useEffect, useRef, useState } from "react";
import StarField from "./StarField";
import { INTRO, OPENING_SESSION_KEY } from "../constants/intro";

/* アニメーション時間（ms）。shortMode は再訪・reduced-motion 用 */
const FADE_IN = 600;
const SEQUENCE_STEP = 500;
const SHORT_MODE_DURATION = 220;

interface OpeningProps {
  onOpen: () => void;
}

/** sessionStorage を安全に読み書きするラッパー。利用不可の場合もクラッシュしない */
function sessionRead(key: string): string | null {
  try {
    return window.sessionStorage?.getItem(key);
  } catch {
    return null;
  }
}
function sessionWrite(key: string, value: string): void {
  try {
    window.sessionStorage?.setItem(key, value);
  } catch {
    /* noop */
  }
}

type OpeningPhase =
  | "stars"
  | "lines"
  | "label"
  | "title"
  | "message"
  | "done";

/**
 * オープニング演出コンポーネント。
 *
 * シーケンス：
 *  dark background
 *   → StarField（星屑が静かに浮かび上がる）
 *   → ゴールドの細い線・オーナメント（控えめな光）
 *   → 英字ラベル
 *   → 日本語タイトル
 *   → メッセージ＋ボタン（操作可能）
 *  Skip で即座に最後へ
 *
 * 遷移は onOpen() コールバック経由で親（App）へ委譲する。
 */
export default function Opening({ onOpen }: OpeningProps) {
  const [phase, setPhase] = useState<OpeningPhase>("stars");
  const [skipVisible, setSkipVisible] = useState(false);

  const rafRef = useRef<number>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const disposedRef = useRef(false);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isShortMode = reducedMotion || sessionRead(OPENING_SESSION_KEY) === "done";

  /* アニメーション完了・スキップ後のクリーンアップ */
  useEffect(() => {
    return () => {
      disposedRef.current = true;
      const raf = rafRef.current;
      cancelAnimationFrame(raf);
      const timers = timersRef.current;
      timers.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const proceed = () => {
    if (disposedRef.current) return;
    clearTimers();
    cancelAnimationFrame(rafRef.current);
    sessionWrite(OPENING_SESSION_KEY, "done");
    onOpen();
  };

  const handleSkip = () => {
    proceed();
  };

  const handleOpen = () => {
    proceed();
  };

  /* reduced-motion / 再訪：短縮表示（すぐ操作・本編へ遷移） */
  useEffect(() => {
    if (!isShortMode) return;
    const t = setTimeout(() => {
      setPhase("done");
      setSkipVisible(false);
      onOpen();
    }, SHORT_MODE_DURATION);
    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [isShortMode, onOpen]);

  /* 初回・通常モード：順次フェードイン */
  useEffect(() => {
    if (isShortMode) return;

    const schedule: Array<{ phase: OpeningPhase; delay: number }> = [
      { phase: "stars", delay: 0 },
      { phase: "lines", delay: FADE_IN },
      { phase: "label", delay: FADE_IN + SEQUENCE_STEP },
      { phase: "title", delay: FADE_IN + SEQUENCE_STEP * 2 },
      { phase: "message", delay: FADE_IN + SEQUENCE_STEP * 3 },
    ];

    schedule.forEach(({ phase: p, delay }) => {
      const t = setTimeout(() => {
        if (disposedRef.current) return;
        setPhase(p);
      }, delay);
      timersRef.current.push(t);
    });

    /* 最後までアニメーションしたら skip 表示 */
    const last = setTimeout(() => {
      if (disposedRef.current) return;
      setSkipVisible(true);
    }, FADE_IN + SEQUENCE_STEP * 4 + 400);
    timersRef.current.push(last);

    return () => {
      clearTimers();
    };
  }, [isShortMode]);

  const fadeStyle = (opacity: number, translateY: number) => ({
    opacity,
    transform: `translateY(${translateY}px)`,
    transition:
      "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
  });

  return (
    <>
      <StarField />
      <main className="opening layer-content container">
        {/* Skip: 常時表示。アニメ完了前でも操作可能 */}
        {skipVisible && (
          <button type="button" className="btn btn--ghost opening__skip" onClick={handleSkip}>
            {INTRO.skipLabel}
          </button>
        )}

        {/* ゴールドの細い線・オーナメント（控えめな光） */}
        {["lines", "label", "title", "message"].includes(phase) ? (
          <div
            className="ornament opening__ornament"
            style={fadeStyle(1, 0)}
            aria-hidden="true"
          >
            <span className="ornament__gem" />
          </div>
        ) : null}

        {/* 英字ラベル */}
        {["label", "title", "message"].includes(phase) ? (
          <p className="latin-label opening__label" style={fadeStyle(1, 0)}>
            {INTRO.label}
          </p>
        ) : null}

        {/* 日本語タイトル */}
        {["title", "message"].includes(phase) ? (
          <h1 className="opening__title font-display gold-text" style={fadeStyle(1, 0)}>
            {INTRO.title}
          </h1>
        ) : null}

        {/* メッセージ＋ボタン */}
        {phase === "message" ? (
          <>
            <p className="text-lead opening__lead" style={fadeStyle(1, 12)}>
              {INTRO.lead}
            </p>
            <button
              type="button"
              className="btn btn--gold opening__cta"
              onClick={handleOpen}
              autoFocus
            >
              {INTRO.buttonLabel}
            </button>
          </>
        ) : null}
      </main>
    </>
  );
}
