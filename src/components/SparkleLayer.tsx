import { useEffect, useRef, useState } from "react";

/**
 * A1: 星空への小さな仕掛け。
 * - インタラクティブ要素でない場所をタップ／クリックすると、金のきらめきが広がる
 * - ときどき（連続しないよう間隔を空けて）短い一言が画面下にふわりと出る
 * - C1（題字の隠しタップ）からは "invitation:celebrate" イベントで大きなきらめきを出す
 * 表示する文言はすべて汎用の挨拶で、秘密情報は含まない。
 * prefers-reduced-motion では何もしない。
 */

const PHRASES = [
  "星に願いを",
  "素敵な夜になりますように",
  "ふたりの旅が、始まります",
  "夢の国で会いましょう",
  "A Wonderful Evening",
];

interface Burst {
  id: number;
  x: number;
  y: number;
  big: boolean;
}

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], [data-no-sparkle]';

export default function SparkleLayer() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [phrase, setPhrase] = useState<string | null>(null);
  const idRef = useRef(0);
  const phraseIndexRef = useRef(0);
  const lastPhraseAtRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(fn, ms);
      timersRef.current.push(t);
    };

    const spawn = (x: number, y: number, big: boolean) => {
      const id = ++idRef.current;
      setBursts((prev) => [...prev.slice(-5), { id, x, y, big }]);
      later(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1100);
    };

    const maybePhrase = () => {
      const now = Date.now();
      if (now - lastPhraseAtRef.current < 6000) return;
      lastPhraseAtRef.current = now;
      const text = PHRASES[phraseIndexRef.current % PHRASES.length];
      phraseIndexRef.current += 1;
      setPhrase(text);
      later(() => setPhrase(null), 3600);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest(INTERACTIVE_SELECTOR)) return;
      spawn(e.clientX, e.clientY, false);
      maybePhrase();
    };

    const onCelebrate = (e: Event) => {
      const detail = (e as CustomEvent<{ x?: number; y?: number }>).detail;
      const x = detail?.x ?? window.innerWidth / 2;
      const y = detail?.y ?? window.innerHeight / 3;
      spawn(x, y, true);
    };

    window.addEventListener("click", onClick);
    window.addEventListener("invitation:celebrate", onCelebrate);
    const timers = timersRef.current;
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("invitation:celebrate", onCelebrate);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (bursts.length === 0 && phrase === null) {
    return <div className="sparkle-layer" aria-hidden="true" />;
  }

  return (
    <div className="sparkle-layer" aria-hidden="true">
      {bursts.map((b) => (
        <span
          key={b.id}
          className={`sparkle-burst${b.big ? " sparkle-burst--big" : ""}`}
          style={{ left: b.x, top: b.y }}
        >
          {Array.from({ length: b.big ? 10 : 6 }).map((_, i) => (
            <span key={i} className="sparkle-dot" style={{ "--i": i } as React.CSSProperties} />
          ))}
        </span>
      ))}
      {phrase && <p className="sparkle-phrase">{phrase}</p>}
    </div>
  );
}
