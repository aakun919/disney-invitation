import OrnamentGem from "./OrnamentGem";

export default function SectionNight() {
  return (
    <div className="section-night">
      <div className="section-night__inner container">
        <div className="section-night__latin-wrap">
          <span className="section-hero__line" aria-hidden="true" />
          <p className="latin-label section-hero__latin">SPECIAL NIGHT</p>
          <span className="section-hero__line" aria-hidden="true" />
        </div>

        <header className="section-night__header">
          <h2 className="section-night__title font-display gold-text">
            特別な夜のひととき
          </h2>
          <p className="section-night__lead">
            灯りと音楽が織りなす、静かで魔法のような時間
          </p>
        </header>

        <p className="section-night__description">
          夜のパークは光に包まれ、昼間とは違う表情を見せてくれます。
          大切な人と一緒に、ゆっくりとした夜の散歩をお楽しみください。
        </p>

        <OrnamentGem className="section-hero__ornament" />
      </div>
    </div>
  );
}
