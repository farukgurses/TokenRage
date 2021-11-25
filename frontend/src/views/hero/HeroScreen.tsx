/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../../config";
import { ethers } from "ethers";
import nftContractABI from "../../artifacts/NFT.json";
import fightingContractABI from "../../artifacts/Fighting.json";
import "./HeroScreen.css";
import Web3Modal from "web3modal";
import { AppContext } from "../../context/state";
import FighterImage from "../../components/FighterImage";
import Header from "../../components/Header";
import Navigator from "./Navigator";
import { Fighter, FighterStat } from "../../components/FighterStats";
import TrainingMode from "./TrainingMode";
import { getPercentage } from "../../utils";
import ArenaMode from "./ArenaMode";

const HeroScreen = (): JSX.Element | null => {
  const [fighter, setFighter] = useState<Fighter>({
    attributes: [
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
      { value: "0", max_value: "0" },
    ],
    name: "",
    image: "",
  });
  const { id } = useParams();
  const { setLoading } = useContext(AppContext);
  const [readyMatchId, setReadyMatchId] = useState();
  const alreadyMatched = readyMatchId !== null && readyMatchId !== undefined;

  const [matches, setMatches] = useState<any>([]);
  const [otherFightersMap, setOtherFighters] = useState<any>({});

  useEffect(() => {
    loadNFT();
    loadMatches();
  }, [id]);

  useEffect(() => {
    loadFightersInvolved();
  }, [matches]);

  async function loadNFT() {
    setLoading(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      config.NFT_CONTRACT,
      nftContractABI,
      signer
    );
    const data = await nftContract.tokenURI(id);

    const base64ToString = Buffer.from(data.split(",")[1], "base64").toString();
    const obj = JSON.parse(base64ToString) as any;
    obj.attributes.map((stat: FighterStat, i: number) => {
      if (i > 4) {
        stat.max_value = (parseInt(obj.attributes[2].value) * 10).toString();
      }
      return stat;
    });
    console.log(obj);
    setFighter(obj);
    setLoading(false);
  }

  async function finishedMatches() {
    // const web3Modal = new Web3Modal();
    // const connection = await web3Modal.connect();
    const provider = new ethers.providers.JsonRpcProvider(
      "https://matic-mumbai.chainstacklabs.com"
    );
    // const provider = new ethers.providers.Web3Provider(connection);
    const fightingContract = new ethers.Contract(
      config.FIGHTING_CONTRACT,
      fightingContractABI,
      provider
    );
    const m = await fightingContract.getFinishedMatchIds(id);
  }

  async function loadMatches() {
    // const web3Modal = new Web3Modal();
    // const connection = await web3Modal.connect();
    const provider = new ethers.providers.JsonRpcProvider(
      "https://matic-mumbai.chainstacklabs.com"
    );
    // const provider = new ethers.providers.Web3Provider(connection);
    const fightingContract = new ethers.Contract(
      config.FIGHTING_CONTRACT,
      fightingContractABI,
      provider
    );

    const mIds = await fightingContract.getMatchesByTokenId(id);
    const matches = [];

    for (const mId of mIds) {
      const matchData = await fightingContract.matchIdToMatch(mId);
      matches.push(matchData);
    }

    setMatches(matches);

    if (matches.length > 0) {
      const mostRecentMatch = matches[matches.length - 1];

      if (mostRecentMatch.end === false) {
        setReadyMatchId(mostRecentMatch.matchId);
      }
    }
  }

  async function loadFightersInvolved() {
    const newFighters: any = {};
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      config.NFT_CONTRACT,
      nftContractABI,
      signer
    );

    for (const currentMatch of matches) {
      for (const fighterN of ["fighterOne", "fighterTwo"]) {
        const currentFighterId = currentMatch[fighterN].toNumber();

        if (currentFighterId != id) {
          const data = await nftContract.tokenURI(currentFighterId);
          const base64ToString = Buffer.from(
            data.split(",")[1],
            "base64"
          ).toString();
          const fighterData = JSON.parse(base64ToString) as any;

          newFighters[currentFighterId] = fighterData;
        }
      }
    }

    setOtherFighters(newFighters);
  }

  if (!id) return null;

  const characterType = fighter.attributes.find(
    (attr) => attr.trait_type === "Type"
  )?.value;

  const leftBlock = (
    <>
      <div
        className="stat-container"
        title={`${parseInt(fighter.attributes[4].value)}/${
          config.FIGHTER_STATS_VALUES.HP.max_value
        }`}
      >
        <span className="stat-name">Hp</span>
        <div className="hero-bar-container">
          <div
            className="stats hp"
            style={{
              width:
                getPercentage(
                  parseInt(fighter.attributes[4].value),
                  config.FIGHTER_STATS_VALUES.HP.max_value
                ) + "%",
              backgroundColor: config.FIGHTER_STATS_VALUES.HP.color,
            }}
          >
            {parseInt(fighter.attributes[4].value)}
          </div>
        </div>
      </div>

      <div
        className="stat-container"
        title={`${parseInt(fighter.attributes[5].value)}/${parseInt(
          fighter.attributes[5].max_value
        )}`}
      >
        <span className="stat-name">Strength</span>
        <div className="hero-bar-container">
          <div
            className="stats strength"
            style={{
              width:
                getPercentage(
                  parseInt(fighter.attributes[5].value),
                  parseInt(fighter.attributes[5].max_value)
                ) + "%",
              backgroundColor: config.FIGHTER_STATS_VALUES.Strength.color,
            }}
          >
            {parseInt(fighter.attributes[5].value)}
          </div>
        </div>
      </div>

      <div
        className="stat-container"
        title={`${parseInt(fighter.attributes[6].value)}/${parseInt(
          fighter.attributes[6].max_value
        )}`}
      >
        <span className="stat-name">Dexterity</span>
        <div className="hero-bar-container">
          <div
            className="stats dexterity"
            style={{
              width:
                getPercentage(
                  parseInt(fighter.attributes[6].value),
                  parseInt(fighter.attributes[6].max_value)
                ) + "%",
              backgroundColor: config.FIGHTER_STATS_VALUES.Dexterity.color,
            }}
          >
            {parseInt(fighter.attributes[6].value)}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Suspense fallback={<>LOADING...</>}>
      <main className="main-centered-content">
        <section className="main-container">
          <Header />
          <div className="hero-container">
            <div className="hero-section hero-side shown-unless-small-screen">
              {leftBlock}
            </div>
            <div className="hero-section hero-mid character-image-section">
              <div>
                <FighterImage fighter={fighter} showName={true} />
                <div className="fighter-main-stats">
                  <div>{characterType}</div>
                  <div>{parseInt(fighter.attributes[2].value)} level</div>
                  <div>{parseInt(fighter.attributes[3].value)} wins</div>
                </div>
              </div>
            </div>

            <div className="hero-section hero-side">
              <div className="hidden-unless-small-screen">{leftBlock}</div>
              <div
                className="stat-container"
                title={`${parseInt(fighter.attributes[9].value)}/${parseInt(
                  fighter.attributes[9].max_value
                )}`}
              >
                <span className="stat-name">Durability</span>
                <div className="hero-bar-container">
                  <div
                    className="stats durability"
                    style={{
                      width:
                        getPercentage(
                          parseInt(fighter.attributes[9].value),
                          parseInt(fighter.attributes[9].max_value)
                        ) + "%",
                      backgroundColor:
                        config.FIGHTER_STATS_VALUES.Durability.color,
                    }}
                  >
                    {parseInt(fighter.attributes[9].value)}
                  </div>
                </div>
              </div>

              <div
                className="stat-container"
                title={`${parseInt(fighter.attributes[8].value)}/${parseInt(
                  fighter.attributes[8].max_value
                )}`}
              >
                <span className="stat-name">Intelligence</span>
                <div className="hero-bar-container">
                  <div
                    className="stats intelligence"
                    style={{
                      width:
                        getPercentage(
                          parseInt(fighter.attributes[8].value),
                          parseInt(fighter.attributes[8].max_value)
                        ) + "%",
                      backgroundColor:
                        config.FIGHTER_STATS_VALUES.Intelligence.color,
                    }}
                  >
                    {parseInt(fighter.attributes[8].value)}
                  </div>
                </div>
              </div>
              <div
                className="stat-container"
                title={`${parseInt(fighter.attributes[7].value)}/${parseInt(
                  fighter.attributes[7].max_value
                )}`}
              >
                <span className="stat-name">Agility</span>
                <div className="hero-bar-container">
                  <div
                    className="stats agility"
                    style={{
                      width:
                        getPercentage(
                          parseInt(fighter.attributes[7].value),
                          parseInt(fighter.attributes[7].max_value)
                        ) + "%",
                      backgroundColor:
                        config.FIGHTER_STATS_VALUES.Agility.color,
                    }}
                  >
                    {parseInt(fighter.attributes[7].value)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <TrainingMode id={id} fighter={fighter} loadNFT={loadNFT} />
        <ArenaMode
          id={id}
          fighter={fighter}
          otherFighters={otherFightersMap}
          matches={matches}
          readyMatchId={readyMatchId}
        />
        <Navigator
          id={id}
          loadNFT={loadNFT}
          fighter={fighter}
          alreadMatched={alreadyMatched}
        />
      </main>
    </Suspense>
  );
};

export default HeroScreen;
