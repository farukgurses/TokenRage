import React, { useContext, useState } from "react";
import FAQContent from "../config/FAQ.json";
import { AppContext } from "../context/state";

function FAQItem({ section, name }: { name: string; section: string }) {
  const [isOpened, setIsOpened] = useState(false);
  const content = (
    FAQContent as unknown as Record<string, Record<string, string>>
  )[section][name];

  return (
    <div
      className={`faq-section-item ${isOpened && "opened"}`}
      onClick={() => setIsOpened((v) => !v)}
    >
      <div className="item-collapse-icon">{isOpened ? "-" : "+"}</div>
      <div className="faq-section-name">{name}</div>
      <div className={`faq-section-content-container ${isOpened && "opened"}`}>
        {content}
      </div>
    </div>
  );
}

function FAQSection({ name }: { name: string }): JSX.Element {
  const content = Object.keys(
    (FAQContent as unknown as Record<string, string>)[name]
  );

  return (
    <div className="faq-section">
      <h3>{name}</h3>
      {content.map((key, k) => (
        <FAQItem key={k} section={name} name={key} />
      ))}
    </div>
  );
}

type FAQProps = {
  focusedSection?: string;
};
export default function FAQ({ focusedSection }: FAQProps): JSX.Element {
  const content = Object.keys(FAQContent);
  const { setModalContent } = useContext(AppContext);

  const onBack = () => {
    setModalContent(<FAQ />);
  };

  if (focusedSection) {
    return (
      <div className="faq-container">
        <FAQSection name={focusedSection} />
        <div className="back-to-faq" onClick={onBack}>
          ‹ More FAQ questions
        </div>
      </div>
    );
  }
  return (
    <div className="faq-container">
      <h1>TokenRage</h1>
      <p className="hint">
        TokenRage is a Play2Earn RPG/Strategy game with raids, loots and PvP.
        <br />
        You can mint heroes, which are actual NFTs, train their skills, fight in
        deatchmatches, go to adventures and build aliances.
      </p>
      {content.map((key, k) => (
        <FAQSection key={k} name={key} />
      ))}
    </div>
  );
}
