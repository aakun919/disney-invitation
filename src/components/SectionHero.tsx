import OrnamentGem from "./OrnamentGem";

interface SectionHeroProps {
  title: string;
  lead?: string;
  latinLabel?: string;
  parkName?: string;
  dateText?: string;
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
  dateText,
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

        {dateText && (
          <p className="section-hero__date">{dateText}</p>
        )}

        {parkName && (
          <p className="section-hero__park">{parkName}</p>
        )}

        {lead && lead.trim().length > 0 && (
          <p className="section-hero__lead">{lead}</p>
        )}

        <OrnamentGem className="section-hero__ornament" />
      </div>
    </header>
  );
}
