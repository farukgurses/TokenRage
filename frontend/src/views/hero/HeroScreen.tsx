import React, { Suspense } from "react";
import { useParams } from "react-router-dom";
import config from "../../config";
import { ethers } from "ethers";
import nftContractABI from "../../artifacts/NFT.json";
import trainingContractABI from "../../artifacts/Training.json";
import "./HeroScreen.css";
import {
  useContract,
  useReadContract,
  useWaitForTransaction,
  useWriteContract,
} from "ethereal-react";
const HeroScreen = () => {
  const { id } = useParams();
  const nftContract = useContract(config.NFT_CONTRACT, nftContractABI);

  const trainingContract = useContract(
    config.TRAINING_CONTRACT,
    trainingContractABI
  );
  const f = useReadContract(nftContract, "tokenIdToFighter", id);
  let tokenURI = useReadContract(nftContract, "tokenURI", id);

  const [requestTraining, { loading, data }] = useWriteContract(
    trainingContract,
    "requestTraining"
  );
  const [finishTrainingAgi, { loading: _, data: data2 }] = useWriteContract(
    trainingContract,
    "finishTrainingDur"
  );

  const base64ToString = Buffer.from(
    tokenURI.split(",")[1],
    "base64"
  ).toString();
  const obj = JSON.parse(base64ToString) as any;
  const startTraining = () => {
    const price = ethers.utils.parseUnits("0.01", "ether");
    requestTraining(id, { value: price });
  };
  const finishTrainingAgiClicked = () => {
    finishTrainingAgi(id);
  };

  if (data) {
    useWaitForTransaction(data);
  }
  if (data2) {
    useWaitForTransaction(data2);
    tokenURI = useReadContract(nftContract, "tokenURI", id);
  }

  return (
    <Suspense fallback={<>LOADING...</>}>
      <main className="main-container">
        <img
          srcSet="/assets/logo@2x.png 2x"
          src="/assets/logo.png"
          className="tokenrage-logo"
        />
        <div className="hero-container">
          <div className="hero-section hero-side">
            <div className="stat-container">
              <span className="stat-name">Hp</span>
              <div className="hero-bar-container">
                <div
                  className="stats hp"
                  style={{
                    width: (f.hp.toNumber() * 100) / 2000,
                  }}
                >
                  {f.hp.toNumber()}
                </div>
              </div>
            </div>

            <div className="stat-container">
              <span className="stat-name">Strength</span>
              <div className="hero-bar-container">
                <div
                  className="stats strength"
                  style={{ width: (f.strength.toNumber() * 100) / 500 }}
                >
                  {f.strength.toNumber()}
                </div>
              </div>
            </div>

            <div className="stat-container">
              <span className="stat-name">Dexterity</span>
              <div className="hero-bar-container">
                <div
                  className="stats dexterity"
                  style={{ width: (f.dexterity.toNumber() * 100) / 500 }}
                >
                  {f.dexterity.toNumber()}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-section hero-mid">
            <div>
              <img src={obj.image} alt="" />
              <div className="connect-button-container" onClick={startTraining}>
                <img
                  srcSet="/assets/continue-with-metamask-button@2x.png 2x"
                  src="/assets/continue-with-metamask-button.png"
                />
              </div>
            </div>
          </div>

          <div className="hero-section hero-side">
            <div className="stat-container">
              <span className="stat-name">Agility</span>
              <div className="hero-bar-container">
                <div
                  className="stats agility"
                  style={{ width: (f.agility.toNumber() * 100) / 500 }}
                >
                  {f.agility.toNumber()}
                </div>
              </div>
            </div>
            <div className="stat-container">
              <span className="stat-name">Intelligence</span>
              <div className="hero-bar-container">
                <div
                  className="stats intelligence"
                  style={{ width: (f.intelligence.toNumber() * 100) / 500 }}
                >
                  {f.intelligence.toNumber()}
                </div>
              </div>
            </div>
            <div className="stat-container">
              <span className="stat-name" onClick={finishTrainingAgiClicked}>
                Durability
              </span>
              <div className="hero-bar-container">
                <div
                  className="stats durability"
                  style={{ width: (f.durability.toNumber() * 100) / 500 }}
                >
                  {f.durability.toNumber()}
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
