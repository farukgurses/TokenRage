import React from "react";

import {
  buildStyles,
  CircularProgressbar,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./FighterStyles.css";

import configs from "../config";

type AttributeTrait =
  | "Level"
  | "HP"
  | "Strength"
  | "Dexterity"
  | "Agility"
  | "Intelligence"
  | "Durability";
type FighterTraits = "Type" | "Location" | AttributeTrait;

export type FighterStats = Array<{
  trait_type?: string;
  max_value?: string;
  value: string;
}>;

export type Fighter = {
  name: string;
  attributes: FighterStats;
  image: string;
};

type Props = {
  fighter: Fighter;
};

const getAttributeMaxValue = (name: AttributeTrait) =>
  configs.FIGHTER_STATS_VALUES[name].max_value;
const getAttributeColor = (name: AttributeTrait) =>
  configs.FIGHTER_STATS_VALUES[name].color;

export default function FighterStats({ fighter }: Props) {
  const getAttributeValue = (name: AttributeTrait) =>
    parseInt(
      fighter?.attributes?.find((attr) => attr.trait_type === name)?.value || ""
    );
  const HP = getAttributeValue("HP");

  if (!fighter?.attributes || !HP) {
    // if HP is not returned it means that the stats are not available
    return null;
  }

  return (
    <div className="fighter-stats-container">
      <div className="fighter-left-stats">
        <CircularProgressbarWithChildren
          value={getAttributeValue("Dexterity")}
          maxValue={getAttributeMaxValue("Dexterity")}
          strokeWidth={2}
          circleRatio={0.48}
          styles={buildStyles({
            pathColor: getAttributeColor("Dexterity"),
            rotation: 0.51,
            trailColor: "transparent",
          })}
        >
          {/*
          Width here needs to be (100 - 2 * strokeWidth)% 
          in order to fit exactly inside the outer progressbar.
        */}
          <div style={{ width: "94%" }}>
            <CircularProgressbarWithChildren
              value={getAttributeValue("Strength")}
              circleRatio={0.482}
              strokeWidth={2}
              maxValue={getAttributeMaxValue("Strength")}
              styles={buildStyles({
                rotation: 0.509,
                trailColor: "transparent",
                pathColor: getAttributeColor("Strength"),
              })}
            >
              <div style={{ width: "94%" }}>
                <CircularProgressbar
                  value={getAttributeValue("HP")}
                  circleRatio={0.48}
                  maxValue={getAttributeMaxValue("HP")}
                  strokeWidth={2}
                  styles={buildStyles({
                    rotation: 0.51,
                    trailColor: "transparent",
                    pathColor: getAttributeColor("HP"),
                  })}
                />
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <div className="fighter-right-stats">
        <CircularProgressbarWithChildren
          value={getAttributeValue("Agility")}
          maxValue={getAttributeMaxValue("Agility")}
          strokeWidth={2}
          counterClockwise
          circleRatio={0.48}
          styles={buildStyles({
            pathColor: getAttributeColor("Agility"),
            rotation: 0.49,
            trailColor: "transparent",
          })}
        >
          {/*
          Width here needs to be (100 - 2 * strokeWidth)% 
          in order to fit exactly inside the outer progressbar.
        */}
          <div style={{ width: "94%" }}>
            <CircularProgressbarWithChildren
              value={getAttributeValue("Intelligence")}
              circleRatio={0.478}
              strokeWidth={2}
              counterClockwise
              maxValue={getAttributeMaxValue("Intelligence")}
              styles={buildStyles({
                rotation: 0.489,
                trailColor: "transparent",
                pathColor: getAttributeColor("Intelligence"),
              })}
            >
              <div style={{ width: "94%" }}>
                <CircularProgressbar
                  value={getAttributeValue("Durability")}
                  circleRatio={0.48}
                  maxValue={getAttributeMaxValue("Durability")}
                  strokeWidth={2}
                  counterClockwise
                  styles={buildStyles({
                    rotation: 0.49,
                    trailColor: "transparent",
                    pathColor: getAttributeColor("Durability"),
                  })}
                />
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </CircularProgressbarWithChildren>
      </div>
    </div>
  );
}
