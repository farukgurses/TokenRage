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
}): JSX.Element {
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
        {showName && <div className="fighter-name-small">{fighter.name}</div>}
      </div>
    </div>
  );
}
