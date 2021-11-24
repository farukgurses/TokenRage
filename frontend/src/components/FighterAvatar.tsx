import React from "react";
import { Fighter } from "./FighterStats";

import "./FighterStyles.css";

export default function FighterAvatar({
  fighter,
}: {
  fighter: Fighter;
}): JSX.Element | null {
  if (!fighter?.attributes) return null;

  const locationTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Location"
  );

  const characterTypeTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Type"
  );

  const characterLevelTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Level"
  );

  if (!locationTrait || !characterTypeTrait || !characterLevelTrait)
    return null;

  let location;
  const locationValue = parseInt(locationTrait.value);
  switch (locationValue) {
    case 0:
      location = "cave";
      break;
    case 1:
      location = "training";
      break;
    case 2:
      location = "arena";
      break;
    case 999:
      location = "cemetery";
      break;
  }

  const characterType = characterTypeTrait.value.toLowerCase();

  const level = parseInt(characterLevelTrait.value);
  const levelImage = level < 25 ? 1 : level < 50 ? 2 : level < 75 ? 3 : 4;

  return (
    <>
      <div
        className={`fighter-avatar-location fighter-avatar-location-${location}`}
      ></div>
      {locationValue !== 999 && (
        <div className="fighter-image-layer">
          <div
            className={`fighter-avatar-character fighter-avatar-character-${characterType}-level-${levelImage}`}
          ></div>
        </div>
      )}
    </>
  );
}
