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
import { Fighter } from "../../components/FighterStats";
import TrainingMode from "./TrainingMode";
import { getPercentage } from "../../utils";

const HeroScreen = (): JSX.Element => {
  const [fighter, setFighter] = useState<Fighter>({
    attributes: [
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
      { value: "0" },
    ],
    name: "",
    image:
      "https://st.depositphotos.com/2885805/3842/v/600/depositphotos_38422667-stock-illustration-coming-soon-message-illuminated-with.jpg",
  });
  const { id } = useParams();
  const { setLoading } = useContext(AppContext);

  useEffect(() => {
    loadNFT();
  }, []);

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

    console.log(m);
  }
  async function unfinishedMatches() {
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
    const m = await fightingContract.getUnFinishedMatchIds(id);

    console.log(m);
  }
  async function startFight(id: number) {
    console.log(id);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const fightingContract = new ethers.Contract(
      config.FIGHTING_CONTRACT,
      fightingContractABI,
      signer
    );

    const m = await fightingContract.finishMatch(id);
  }

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
        title={`${parseInt(fighter.attributes[5].value)}/${
          config.FIGHTER_STATS_VALUES.Strength.max_value
        }`}
      >
        <span className="stat-name">Strength</span>
        <div className="hero-bar-container">
          <div
            className="stats strength"
            style={{
              width:
                getPercentage(
                  parseInt(fighter.attributes[5].value),
                  config.FIGHTER_STATS_VALUES.Strength.max_value
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
        title={`${parseInt(fighter.attributes[6].value)}/${
          config.FIGHTER_STATS_VALUES.Dexterity.max_value
        }`}
      >
        <span className="stat-name">Dexterity</span>
        <div className="hero-bar-container">
          <div
            className="stats dexterity"
            style={{
              width:
                getPercentage(
                  parseInt(fighter.attributes[6].value),
                  config.FIGHTER_STATS_VALUES.Dexterity.max_value
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
                title={`${parseInt(fighter.attributes[9].value)}/${
                  config.FIGHTER_STATS_VALUES.Durability.max_value
                }`}
              >
                <span className="stat-name">Durability</span>
                <div className="hero-bar-container">
                  <div
                    className="stats durability"
                    style={{
                      width:
                        getPercentage(
                          parseInt(fighter.attributes[9].value),
                          config.FIGHTER_STATS_VALUES.Durability.max_value
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
                title={`${parseInt(fighter.attributes[8].value)}/${
                  config.FIGHTER_STATS_VALUES.Intelligence.max_value
                }`}
              >
                <span className="stat-name">Intelligence</span>
                <div className="hero-bar-container">
                  <div
                    className="stats intelligence"
                    style={{
                      width:
                        getPercentage(
                          parseInt(fighter.attributes[8].value),
                          config.FIGHTER_STATS_VALUES.Intelligence.max_value
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
                title={`${parseInt(fighter.attributes[7].value)}/${
                  config.FIGHTER_STATS_VALUES.Agility.max_value
                }`}
              >
                <span className="stat-name">Agility</span>
                <div className="hero-bar-container">
                  <div
                    className="stats agility"
                    style={{
                      width:
                        getPercentage(
                          parseInt(fighter.attributes[6].value),
                          config.FIGHTER_STATS_VALUES.Agility.max_value
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
        <Navigator id={id} loadNFT={loadNFT} fighter={fighter} />
      </main>
    </Suspense>
  );
};

export default HeroScreen;
