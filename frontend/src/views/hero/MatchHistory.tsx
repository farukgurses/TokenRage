import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { Fighter } from "../../components/FighterStats";
import FighterImage from "../../components/FighterImage";

export type Match = {
  matchId: string;
  matchLogs: string;
  fighterOne: BigNumber;
  fighterTwo: BigNumber;
  end: boolean;
  winner: BigNumber;
  looser: BigNumber;
};

type MatchHistoryProps = {
  id: string;
  fighter: Fighter;
  otherFighters: { [key: number]: Fighter };
  matches: Match[];
};

type MatchLogItemProps = Omit<MatchHistoryProps, "matches"> & { match: Match };
const MatchLogItem = ({
  id,
  fighter,
  match,
  otherFighters,
}: MatchLogItemProps): JSX.Element | null => {
  const isOpenFight = match.end === false;
  const roundLogs = atob(match.matchLogs)
    .split("/")
    .filter((s) => s.trim() !== "")
    .map((r) => r.split(" ").map((x) => Number(x)));

  const getFighterById = (fId: number) =>
    parseInt(id) === fId ? fighter : otherFighters[fId];

  const winnerId = match.winner.toNumber();
  const loserId = match.looser.toNumber();
  const currentFighter = getFighterById(+id);
  const opponentId = +id === winnerId ? loserId : winnerId;
  const opponent = getFighterById(opponentId);
  const startsFromLeft = match.fighterOne.toNumber() === +id;

  if (isOpenFight || !currentFighter || !opponent) {
    return null;
  }

  return (
    <div className="match-log-item">
      <div className="avatars-container">
        <div className="current-fighter-logs">
          <FighterImage fighter={currentFighter} small showName={false} />
          <div
            className={`logs-fighter-name ${
              winnerId === +id && "winner-font-color"
            } ${loserId === +id && "loser-font-color"}`}
          >
            {currentFighter.name} (
            {
              currentFighter.attributes.find((t) => t.trait_type === "Level")
                ?.value
            }
            )
            <br />
            {winnerId === +id ? "Victory" : "Loss"}
          </div>
        </div>
        <div className="vs-icon"></div>
        <div className="opponent-logs">
          <FighterImage fighter={opponent} small reversed showName={false} />
          <div
            className={`logs-fighter-name ${
              winnerId === opponentId && "winner-font-color"
            } ${loserId === opponentId && "loser-font-color"}`}
          >
            {opponent.name} (
            {opponent.attributes.find((t) => t.trait_type === "Level")?.value})
            <br />
            {winnerId === opponentId ? "Victory" : "Loss"}
          </div>
        </div>
      </div>
      <div className="logs-stats-container">
        <div className="log-border">
          {roundLogs.map((round: number[]) => {
            const title = `Round ${round[0]} / ${roundLogs.length}`;
            const successfullAttack = round[1] != 0;
            const criticalHit = round[2] != 0;
            const damageGiven = round[3];
            const leftCol = startsFromLeft
              ? round[0] % 2 == 0
              : round[0] % 2 !== 0;
            return (
              <div
                className={`round-text ${
                  leftCol ? "round-left" : "round-right"
                }`}
                title={title}
                key={round[0]}
              >
                <div className="round-nr">{title}</div>
                <div
                  className={`attack-round ${
                    successfullAttack ? "winner-font-color" : "loser-font-color"
                  }`}
                >
                  {successfullAttack ? "Successfull attack" : "Missed hit"}
                </div>
                {criticalHit && (
                  <div className={`critical-hit-round`}>+Critical hit</div>
                )}
                Damage given: {damageGiven}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function MatchHistory({
  id,
  fighter,
  matches,
  otherFighters,
}: MatchHistoryProps): JSX.Element | null {
  const locationTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Location"
  );
  const characterTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Type"
  );

  if (!locationTrait || !characterTrait) return null;
  const hadFights = matches.length > 0;
  const isOnArena = parseInt(locationTrait.value) === 2;
  const isDead = parseInt(locationTrait.value) === 999;
  const characterType = characterTrait.value;

  return (
    <section className="match-history main-container">
      <div className="training-icon location-cemetery-icon"></div>
      <h1>Fighting history</h1>
      {hadFights ? (
        <p className="hint">
          {fighter.name} had {matches.length > 1 ? `` : `just`}
          {matches.length} fight
          {matches.length > 1 ? `s` : ``}. <br />
          {isDead
            ? ` He was a true ${characterType}!`
            : isOnArena
            ? `Welcome to Arena, this should change soon...`
            : ` Send them to the Arena to see what they worth ;)`}
        </p>
      ) : (
        <p className="hint">
          The fighting history is empty for Leochai.
          <br />
          {isOnArena
            ? "Welcome to Arena, this should change soon..."
            : "Send them to the Arena to see what they worth ;)"}
        </p>
      )}
      <div className="logs-list">
        {matches.map((match) => (
          <MatchLogItem
            id={id}
            key={match.matchId}
            match={match}
            fighter={fighter}
            otherFighters={otherFighters}
          />
        ))}
      </div>
    </section>
  );
}
