import React, { Suspense, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import config from "../../config";
import { ethers } from "ethers";
import nftContractABI from "../../artifacts/NFT.json";
import trainingContractABI from "../../artifacts/Training.json";
import "./HeroScreen.css";
import Web3Modal from "web3modal";
import { AppContext } from "../../context/state";
import Loading from "../../components/Loading";
import { message } from "antd";
import { sleep } from "../../utils";
import FighterStats from "../../components/FighterStats";
import { FighterCard } from "../../components/FighterCard";
import FighterImage from "../../components/FighterImage";

enum Stat {
  STR,
  DEX,
  AGI,
  INT,
  DUR,
}

const HeroScreen = () => {
  const [fighter, setFighter] = useState({
    attributes: [
      { value: "100" },
      { value: "100" },
      { value: "100" },
      { value: "100" },
      { value: "100" },
      { value: "100" },
      { value: "100" },
      { value: "100" },
    ],
    name: "",
    image:
      "https://st.depositphotos.com/2885805/3842/v/600/depositphotos_38422667-stock-illustration-coming-soon-message-illuminated-with.jpg",
  });
  const { id } = useParams();
  const { loading, setLoading } = useContext(AppContext);

  useEffect(() => {
    loadNFT();
  }, []);

  async function loadNFT() {
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

  async function startTraining() {
    setLoading(true);
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const trainingContract = new ethers.Contract(
        config.TRAINING_CONTRACT,
        trainingContractABI,
        signer
      );
      const price = ethers.utils.parseUnits("0.01", "ether");
      const transaction = await trainingContract.requestTraining(id, {
        value: price,
      });
      await transaction.wait();
    } catch (error: any) {
      message.error(error.message, 2);
    }

    setLoading(false);
  }
  async function finishTraining(stat: Stat) {
    setLoading(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const trainingContract = new ethers.Contract(
      config.TRAINING_CONTRACT,
      trainingContractABI,
      signer
    );
    try {
      switch (stat) {
        case Stat.STR:
          await trainingContract.finishTrainingStr(id);
          break;
        case Stat.DEX:
          await trainingContract.finishTrainingDex(id);
          break;
        case Stat.AGI:
          await trainingContract.finishTrainingAgi(id);
          break;
        case Stat.INT:
          await trainingContract.finishTrainingInt(id);
          break;
        case Stat.DUR:
          await trainingContract.finishTrainingDur(id);
          break;
      }
      await sleep(3000);
    } catch (error: any) {
      if (error.code === -32603) {
        message.error(
          "You need to click on start training and wait for some time before finishing your training",
          2
        );
      }
      message.error(error.message, 2);
    }

    setLoading(false);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<>LOADING...</>}>
      <main className="main-container">
        <Link to="/">
          <img
            srcSet="/assets/logo@2x.png 2x"
            src="/assets/logo.png"
            className="tokenrage-logo"
          />
        </Link>
        <h1 className="fighter-name">{fighter.name}</h1>
        <div className="hero-container">
          <div className="hero-section hero-side">
            <div className="stat-container">
              <span className="stat-name">Hp</span>
              <div className="hero-bar-container">
                <div
                  className="stats hp"
                  style={{
                    width: (parseInt(fighter.attributes[2].value) * 100) / 2000,
                  }}
                >
                  {parseInt(fighter.attributes[2].value)}
                </div>
              </div>
            </div>

            <div
              className="stat-container"
              onClick={() => finishTraining(Stat.STR)}
            >
              <span className="stat-name">Strength</span>
              <div className="hero-bar-container">
                <div
                  className="stats strength"
                  style={{
                    width: (parseInt(fighter.attributes[3].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[3].value)}
                </div>
              </div>
            </div>

            <div
              className="stat-container"
              onClick={() => finishTraining(Stat.DEX)}
            >
              <span className="stat-name">Dexterity</span>
              <div className="hero-bar-container">
                <div
                  className="stats dexterity"
                  style={{
                    width: (parseInt(fighter.attributes[4].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[4].value)}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-section hero-mid">
            <div>
              <FighterImage fighter={fighter} />
              <div className="connect-button-container">
                <button onClick={startTraining}>Start Training</button>
              </div>
            </div>
          </div>

          <div className="hero-section hero-side">
            <div
              className="stat-container"
              onClick={() => finishTraining(Stat.AGI)}
            >
              <span className="stat-name">Agility</span>
              <div className="hero-bar-container">
                <div
                  className="stats agility"
                  style={{
                    width: (parseInt(fighter.attributes[5].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[5].value)}
                </div>
              </div>
            </div>
            <div
              className="stat-container"
              onClick={() => finishTraining(Stat.INT)}
            >
              <span className="stat-name">Intelligence</span>
              <div className="hero-bar-container">
                <div
                  className="stats intelligence"
                  style={{
                    width: (parseInt(fighter.attributes[6].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[6].value)}
                </div>
              </div>
            </div>
            <div
              className="stat-container"
              onClick={() => finishTraining(Stat.DUR)}
            >
              <span className="stat-name">Durability</span>
              <div className="hero-bar-container">
                <div
                  className="stats durability"
                  style={{
                    width: (parseInt(fighter.attributes[7].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[7].value)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
};

export default HeroScreen;
