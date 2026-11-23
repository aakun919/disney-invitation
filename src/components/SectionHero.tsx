interface SectionHeroProps {
  title: string;
  lead?: string;
  latinLabel?: string;
  parkName?: string;
}

const DEFAULT_LATIN_MAP: Record<string, string> = {
  "1日目": "DAY ONE",
  "2日目": "DAY TWO",
  "夜": "NIGHT SPECIAL",
};

export default function SectionHero({
  title,
  lead,
  latinLabel,
  parkName,
}: SectionHeroProps) {
  const displayLatin = latinLabel || DEFAULT_LATIN_MAP[title] || "";

  return (
    <header className="section-hero">
      <div className="section-hero__inner container">
        {displayLatin && (
          <div className="section-hero__latin-wrap">
            <span className="section-hero__line" aria-hidden="true" />
            <p className="latin-label section-hero__latin">{displayLatin}</p>
            <span className="section-hero__line" aria-hidden="true" />
          </div>
        )}

        <h2 className="section-hero__title font-display gold-text">
          {title}
        </h2>

        {parkName && (
          <p className="section-hero__park">{parkName}</p>
        )}

        {lead && lead.trim().length > 0 && (
          <p className="section-hero__lead">{lead}</p>
        )}

        <div className="ornament section-hero__ornament" aria-hidden="true">
          <span className="ornament__gem" />
        </div>
      </div>
    </header>
  );
}
