import React from "react";
import FighterAvatar from "./FighterAvatar";
import FighterStats, { Fighter } from "./FighterStats";

import "./FighterStyles.css";

export default function FighterImage({ fighter }: { fighter: Fighter }) {
  return (
    <div className="fighter-image-container">
      <div className="fighter-image-layer">
        <FighterAvatar fighter={fighter} />
      </div>
      <div className="fighter-image-layer">
        <FighterStats fighter={fighter} />
      </div>
    </div>
  );
}