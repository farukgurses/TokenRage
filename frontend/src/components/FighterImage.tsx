import React from "react";
import FighterAvatar from "./FighterAvatar";
import FighterStats, { Fighter } from "./FighterStats";

import "./FighterStyles.css";

export default function FighterImage({
  fighter,
  showName = true,
  small = false,
  reversed = false,
}: {
  fighter: Fighter;
  showName?: boolean;
  small?: boolean;
  reversed?: boolean;
}): JSX.Element | null {
  const locationTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Location"
  );

  if (!locationTrait) return null;

  const isDead = parseInt(locationTrait.value) === 999;

  return (
    <div
      className={`fighter-image-container ${small && "small"} ${
        reversed && "reversed"
      }`}
    >
      <div className="fighter-image-layer">
        <FighterAvatar fighter={fighter} />
      </div>
      <div className="fighter-image-layer">
        <FighterStats fighter={fighter} />
        {showName && (
          <div className={`fighter-name-small ${isDead && "dead"}`}>
            {fighter.name}
          </div>
        )}
      </div>
    </div>
  );
}
