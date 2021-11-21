/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../../config";
import { ethers } from "ethers";
import nftContractABI from "../../artifacts/NFT.json";
import trainingContractABI from "../../artifacts/Training.json";
import fightingContractABI from "../../artifacts/Fighting.json";
import "./HeroScreen.css";
import Web3Modal from "web3modal";
import { AppContext } from "../../context/state";
import { message } from "antd";
import { sleep } from "../../utils";
import FighterImage from "../../components/FighterImage";
import Header from "../../components/Header";
enum Stat {
  STR,
  DEX,
  AGI,
  INT,
  DUR,
}

const HeroScreen = (): JSX.Element => {
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

  async function goToTraining() {
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
      await sleep(10000);
      await loadNFT();
    } catch (error: any) {
      if (error.data.message) {
        message.error(error.data.message, 2);
      } else {
        message.error(error.message, 2);
      }
    }

    setLoading(false);
  }
  async function goToArena() {
    setLoading(true);
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const fightingContract = new ethers.Contract(
        config.FIGHTING_CONTRACT,
        fightingContractABI,
        signer
      );
      const transaction = await fightingContract.toggleOpenToFight(id);
      await transaction.wait();
      await sleep(10000);
      await loadNFT();
    } catch (error: any) {
      if (error.data.message) {
        message.error(error.data.message, 2);
      } else {
        message.error(error.message, 2);
      }
    }

    setLoading(false);
  }
  async function finishTraining(stat: Stat) {
    if (parseInt(fighter.attributes[1].value) !== 1) {
      return message.error(
        "You need to be in Training Range to train your stats",
        2
      );
    }
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
      await sleep(20000);
      await loadNFT();
    } catch (error: any) {
      if (error.code === -32603) {
        message.error(
          "Your Fighter is getting ready for training, please try again soon",
          2
        );
      } else {
        message.error(error.message, 2);
      }
      await loadNFT();
    }

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

  return (
    <Suspense fallback={<>LOADING...</>}>
      <main className="main-container">
        <Header />
        <div className="hero-container">
          <div className="hero-section hero-side">
            <div className="stat-container stat-bold">
              <span className="stat-name">
                Level: {parseInt(fighter.attributes[2].value)}
              </span>
            </div>
            <div className="stat-container">
              <span className="stat-name">Hp</span>
              <div className="hero-bar-container">
                <div
                  className="stats hp"
                  style={{
                    width: (parseInt(fighter.attributes[4].value) * 100) / 2000,
                  }}
                >
                  {parseInt(fighter.attributes[4].value)}
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
                    width: (parseInt(fighter.attributes[5].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[5].value)}
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
                    width: (parseInt(fighter.attributes[6].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[6].value)}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-section hero-mid">
            <div>
              <FighterImage fighter={fighter} showName={true} />

              <div className="hero-button-container">
                <button onClick={goToTraining}>Training Range</button>
                <button onClick={goToArena}>Arena</button>
                {/* <button onClick={() => startFight(0)}>START</button> */}
                {/* <button onClick={() => unfinishedMatches()}>
                  ready matches
                </button>

                <button onClick={() => finishedMatches()}>match history</button> */}
              </div>
            </div>
          </div>

          <div className="hero-section hero-side">
            <div className="stat-container">
              <span className="stat-name stat-bold">
                Wins: {parseInt(fighter.attributes[3].value)}
              </span>
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
                    width: (parseInt(fighter.attributes[9].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[9].value)}
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
                    width: (parseInt(fighter.attributes[8].value) * 100) / 500,
                  }}
                >
                  {parseInt(fighter.attributes[8].value)}
                </div>
              </div>
            </div>
            <div
              className="stat-container"
              onClick={() => finishTraining(Stat.AGI)}
            >
              <span className="stat-name">Agility</span>
              <div className="hero-bar-container">
                <div
                  className="stats agility"
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
