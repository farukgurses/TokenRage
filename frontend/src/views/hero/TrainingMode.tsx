import React, { useCallback, useContext, useState } from "react";
import Web3Modal from "web3modal";
import { AppContext } from "../../context/state";
import "./HeroScreen.css";
import "./HeroScreen.css";
import { message } from "antd";
import { ethers } from "ethers";
import trainingContractABI from "../../artifacts/Training.json";
import config from "../../config";
import { getPercentage, sleep } from "../../utils";
import { AttributeTrait, Fighter } from "../../components/FighterStats";
import FAQ from "../../config/FAQ.json";

const traits: AttributeTrait[] = [
  "HP",
  "Durability",
  "Strength",
  "Intelligence",
  "Dexterity",
  "Agility",
];

type TraitProps = {
  trait: AttributeTrait;
  fighter: Fighter;
  finishTraining(stat: AttributeTrait): void;
  trainingInitated: boolean;
};

const Trait = ({
  trait,
  fighter,
  finishTraining,
  trainingInitated,
}: TraitProps): JSX.Element | null => {
  const currentTrait = fighter.attributes.find((t) => t.trait_type === trait);

  if (!currentTrait) return null;

  const value = parseInt(currentTrait.value);
  const maxValue =
    trait === "HP"
      ? config.FIGHTER_STATS_VALUES["HP"].max_value
      : parseInt(fighter.attributes[2].value) * 10;
  const canTrain = trait !== "HP";

  const onPressTrain = () => {
    if (canTrain) {
      finishTraining(trait);
    }
  };

  return (
    <div className="train-trait-container">
      <h3>{trait}</h3>
      <p className="hint">{FAQ.Traits[trait]}</p>
      <div className="train-button-container">
        <div className="current-trait-value">
          <span>
            {value} / {maxValue}
          </span>
          <div className="trait-progressbar">
            <div
              className="trait-progress"
              style={{
                width: getPercentage(value, maxValue) + "%",
                backgroundColor: config.FIGHTER_STATS_VALUES[trait].color,
              }}
            ></div>
          </div>
        </div>
        <button
          disabled={!canTrain || trainingInitated}
          onClick={onPressTrain}
          className="train-trait-button"
          style={{
            backgroundColor: config.FIGHTER_STATS_VALUES[trait].color,
          }}
        >
          Train {trait}
        </button>
      </div>
    </div>
  );
};

type TrainingModeProps = {
  id?: string;
  loadNFT(): void;
  fighter: Fighter;
};

export default function TrainingMode({
  id,
  fighter,
  loadNFT,
}: TrainingModeProps): JSX.Element | null {
  const { setLoading } = useContext(AppContext);
  const [trainingInitated, setTrainingInitated] = useState(false);

  const finishTraining = useCallback(
    async function (stat: AttributeTrait) {
      if (parseInt(fighter.attributes[1].value) !== 1) {
        return;
      }

      setLoading(true);
      setTrainingInitated(true);

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
          case "Strength":
            await trainingContract.finishTrainingStr(id);
            break;
          case "Dexterity":
            await trainingContract.finishTrainingDex(id);
            break;
          case "Agility":
            await trainingContract.finishTrainingAgi(id);
            break;
          case "Intelligence":
            await trainingContract.finishTrainingInt(id);
            break;
          case "Durability":
            await trainingContract.finishTrainingDur(id);
            break;
        }
        await sleep(20000);
        await loadNFT();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      setTrainingInitated(false);
    },
    [id, loadNFT]
  );

  if (!fighter?.attributes) return null;

  const locationTrait = fighter.attributes.find(
    (attr) => attr.trait_type === "Location"
  );

  if (!locationTrait || parseInt(locationTrait.value) !== 1) return null;

  return (
    <section className="training-mode-container main-container">
      <div className="training-icon fighter-avatar-location-training"></div>
      <h1>Training range</h1>
      <p className="hint">
        Training allows you to gain important skills that will be used during
        Arena Deathmatches.
        <br />
        Upper limit of the stats are determined by the level.
      </p>
      <div className="traits-grid">
        {traits.map((trait) => (
          <Trait
            key={trait}
            trait={trait}
            fighter={fighter}
            finishTraining={finishTraining}
            trainingInitated={trainingInitated}
          />
        ))}
      </div>
    </section>
  );
}
