import { useEffect, useRef, useState } from "react";

/**
 * A2: オーナメントの宝石の小さな返事。
 * 装飾の宝石をタップすると一度だけ柔らかく光り、短いラテン語の一文が出る。
 * 表示文は装飾テキストのみ（秘密情報は含まない）。
 */

const GEM_PHRASES = [
  "A Wonderful Evening",
  "Under the Same Stars",
  "To a Beautiful Journey",
  "With All My Heart",
];

interface OrnamentGemProps {
  className?: string;
}

export default function OrnamentGem({ className = "" }: OrnamentGemProps) {
  const [glowing, setGlowing] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(
    () => Math.floor(Math.random() * GEM_PHRASES.length),
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    setGlowing(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setGlowing(false);
      setPhraseIndex((i) => (i + 1) % GEM_PHRASES.length);
    }, 2800);
  };

  return (
    <div className={`ornament ornament--interactive ${className}`.trim()}>
      <button
        type="button"
        className="ornament__gem-button"
        aria-label="オーナメントの宝石"
        onClick={handleClick}
      >
        <span className={`ornament__gem${glowing ? " is-glowing" : ""}`} />
      </button>
      <p className={`gem-phrase${glowing ? " is-visible" : ""}`} aria-hidden={!glowing}>
        {GEM_PHRASES[phraseIndex]}
      </p>
    </div>
  );
}
