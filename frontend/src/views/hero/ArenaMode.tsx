import React, { useCallback, useContext, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Fighter } from "../../components/FighterStats";
import fightingContractABI from "../../artifacts/Fighting.json";
import config from "../../config";
import { AppContext } from "../../context/state";
import ReactLoading from "react-loading";
import FighterImage from "../../components/FighterImage";
import { Match } from "./MatchHistory";

type OtherFighters = { [key: number]: Fighter };

type MatchedViewProps = {
  startFight(fn: () => void): void;
  fighter: Fighter;
  opponent: Fighter;
};
const MatchedView = ({ startFight, fighter, opponent }: MatchedViewProps) => {
  const [fightStarted, setStarted] = useState(false);

  if (!opponent) {
    return null;
  }

  const onStartFight = () => {
    startFight(() => setStarted(true));
  };

  const opponentLevel = opponent.attributes.find(
    (t) => t.trait_type === "Level"
  )?.value;

  return (
    <div className="matched-view">
      <div className="fighters-showcase">
        <div className="fighter-one">
          <FighterImage fighter={fighter} small showName={false} />
        </div>
        {fightStarted ? (
          <div className="fight-started-progress">
            <ReactLoading type="cylon" color="#fff" height={64} width={64} />
          </div>
        ) : (
          <div className="match-is-ready-icon"></div>
        )}
        <div className="fighter-two">
          <FighterImage fighter={opponent} small reversed showName={false} />
        </div>
      </div>
      {fightStarted ? (
        <>
          <h2>The fight has started!</h2>
          <p>Come back in a minute to check for the fight results...</p>
        </>
      ) : (
        <>
          <h2>Your fight is ready!</h2>
          <p>
            You were matched with {opponent.name} (level {opponentLevel}).
            <br />
            Now there is no way back! One of you must initiate the fight.
          </p>
          <button className="start-fight-button" onClick={onStartFight}>
            Start Fight
          </button>
        </>
      )}
      <a className="cleared" href="#">
        More info about matchmaking and deathmatches
      </a>
    </div>
  );
};

const LookingForOpponent = () => (
  <div className="looking-for-opponent">
    <div>
      <ReactLoading type="bubbles" color="#fff" height={128} width={128} />
    </div>
    <h2>Waiting for another hero...</h2>
    <p>
      We are trying to match you with a hero with a level similar to yours. You
      can still leave Arena at this point.
      <br />
      Once the hero is found, you will not be able to leave the Arena anymore
      and one of you can start the fight.
      <br />
    </p>
    <a href="#">More info about matchmaking and deathmatches</a>
  </div>
);

type ArenaModeProps = {
  id: string;
  fighter: Fighter;
  otherFighters: OtherFighters;
  matches: Match[];
  readyMatchId?: string;
  loadNFT(): void;
};
export default function ArenaMode({
  id,
  fighter,
  otherFighters,
  matches,
  readyMatchId,
  loadNFT,
}: ArenaModeProps): JSX.Element | null {
  const { setLoading } = useContext(AppContext);
  const alreadyMatched = readyMatchId !== null && readyMatchId !== undefined;

  const startFight = useCallback(
    async function (callback) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const fightingContract = new ethers.Contract(
        config.FIGHTING_CONTRACT,
        fightingContractABI,
        signer
      );

      setLoading(true);
      const transaction = await fightingContract.finishMatch(readyMatchId);
      callback();
      await transaction.wait();
      await loadNFT();
      setLoading(false);
    },
    [readyMatchId, loadNFT]
  );

  const currentLocation = parseInt(
    fighter?.attributes.find((attr) => attr.trait_type === "Location")?.value ||
      "-1"
  );
  const isArena = currentLocation === 2;
  if (!isArena) {
    return null;
  }

  const matchedFight = alreadyMatched
    ? matches.find((m) => m.matchId === readyMatchId)
    : null;
  const opponent =
    !!matchedFight &&
    otherFighters[
      matchedFight.fighterOne.toNumber() == +id
        ? matchedFight.fighterTwo.toNumber()
        : matchedFight.fighterOne.toNumber()
    ];

  return (
    <section className="arena-mode main-container">
      <div className="arena-mode-content">
        {alreadyMatched && !!opponent ? (
          <MatchedView
            startFight={startFight}
            opponent={opponent}
            fighter={fighter}
          />
        ) : (
          <LookingForOpponent />
        )}
      </div>
      <div className="arena-mode-parallax">
        <div className="arena-mode-parallax-far"></div>
        <div className="arena-mode-parallax-mid"></div>
        <div className="arena-mode-parallax-close"></div>
      </div>
    </section>
  );
}
