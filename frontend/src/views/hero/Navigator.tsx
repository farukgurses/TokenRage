/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useContext, useState } from "react";
import Web3Modal from "web3modal";
import { AppContext } from "../../context/state";
import "./HeroScreen.css";
import { message } from "antd";
import { ethers } from "ethers";
import trainingContractABI from "../../artifacts/Training.json";
import fightingContractABI from "../../artifacts/Fighting.json";
import config from "../../config";
import { Fighter } from "../../components/FighterStats";

type Props = {
  id?: string;
  loadNFT(): void;
  fighter: Fighter;
  alreadMatched: boolean;
  loadMatches(): void;
};

export default function Navigator({
  id,
  loadNFT,
  fighter,
  alreadMatched,
  loadMatches,
}: Props): JSX.Element | null {
  const [isNavigating, setIsNavigating] = useState(false);
  const { setLoading } = useContext(AppContext);

  const currentLocation = parseInt(
    fighter.attributes.find((attr) => attr.trait_type === "Location")?.value ||
      "-1"
  );
  const isTraining = currentLocation === 1;
  const isArena = currentLocation === 2;
  const isDead = currentLocation === 999;

  const goToTraining = useCallback(
    async function () {
      if (isNavigating || isTraining) return;

      setLoading(true);
      setIsNavigating(true);
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
        await loadNFT();
        setIsNavigating(false);
      } catch (error: any) {
        if (error.data.message) {
          message.error(error.data.message, 2);
        } else {
          message.error(error.message, 2);
        }
      }

      setLoading(false);
    },
    [isNavigating, isTraining]
  );

  const goToArena = useCallback(
    async function () {
      if (isNavigating || isTraining || (isArena && alreadMatched)) return;

      setLoading(true);
      setIsNavigating(true);
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
        await loadNFT();
        await loadMatches();
        setIsNavigating(false);
      } catch (error: any) {
        if (error.data.message) {
          message.error(error.data.message, 2);
        } else {
          message.error(error.message, 2);
        }
      }

      setLoading(false);
    },
    [isNavigating, isTraining, isArena, alreadMatched]
  );

  if (isDead) return null;

  return (
    <section
      className={`hero-navigation-buttons ${isNavigating ? "navigating" : ""}`}
    >
      {!isArena && (
        <button
          onClick={goToTraining}
          className={`go-training-range-button ${
            (isTraining || isArena) && "in-progress"
          }`}
          key={`training-animation-${fighter.name}`}
        >
          {isTraining
            ? `Please complete training first`
            : `Send ${fighter.name} for Training`}
        </button>
      )}

      <button
        onClick={goToArena}
        className={`${isArena ? `go-cave-button` : "go-arena-button"} ${
          (isTraining || (isArena && alreadMatched)) && `in-progress`
        }`}
        key={`arena-animation-${fighter.name}`}
      >
        {isArena
          ? alreadMatched
            ? `An opponent is ready for the fight. No way back.`
            : `Call ${fighter.name} back from Arena`
          : isTraining
          ? `Please complete training first`
          : `Send ${fighter.name} to Arena`}
      </button>
    </section>
  );
}
