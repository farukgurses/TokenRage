import React from "react";
import "./FighterStyles.css";

export default function CreateNewCharacter({
  onClick,
}: {
  onClick(): void;
}): JSX.Element {
  return (
    <div className="fighter-card inverted" onClick={onClick}>
      <div className="create-new-image fighter-image-container"></div>
    </div>
  );
}
