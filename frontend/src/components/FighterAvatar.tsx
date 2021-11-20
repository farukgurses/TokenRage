import React from "react";
import { Fighter } from "./FighterStats";

import "./FighterStyles.css";

export default function FighterAvatar({ fighter }: { fighter: Fighter }) {
  if (!fighter?.attributes) return null;

  const locationTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Location"
  );

  const characterTypeTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Type"
  );

  if (!locationTrait || !characterTypeTrait) return null;

  const location =
    parseInt(locationTrait.value) === 0
      ? "cave"
      : parseInt(locationTrait.value) === 1
      ? "training"
      : "arena";

  const characterType = characterTypeTrait.value.toLowerCase();

  return (
    <>
      <div
        className={`fighter-avatar-location fighter-avatar-location-${location}`}
      ></div>
      <div className="fighter-image-layer">
        <div
          className={`fighter-avatar-character fighter-avatar-character-${characterType}`}
        ></div>
      </div>
    </>
  );
}
