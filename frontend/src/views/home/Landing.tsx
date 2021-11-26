import { message } from "antd";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

import Web3Modal from "web3modal";
import ConnectedScreen from "./ConnectedScreen";
export default function LandingScreen(): JSX.Element {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const web3Modal = new Web3Modal();

    if (web3Modal.cachedProvider !== "") {
      connect();
    }
  }, []);

  async function connect() {
    const web3Modal = new Web3Modal({ cacheProvider: true });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const { chainId } = await provider.getNetwork();
    if (chainId !== 80001) {
      message.error(
        "Unable to connect to the wallet. Make sure you are on the Mumbai Testnet",
        2
      );
    } else {
      setConnected(true);
    }
  }

  if (connected) {
    return <ConnectedScreen />;
  }

  return (
    <main className="main-container welcome-container">
      <img
        srcSet="/assets/logo@2x.png 2x"
        src="/assets/logo.png"
        className="tokenrage-logo"
      />

      <div className="welcome-text-content">
        <div className="tokenrage-textlogo">
          <img src="/assets/tokenrage-text-logo.png" />
        </div>

        <p className="about-tokenrage">
          Far far away, behind the tall mountains, far from the countries
          Vokalia and Consonantia, was born TokenRage – a new Play2Earn
          RPG/Strategy game with raids, loots and PvP. <br /> <br />
          Demons, Vikings, Knights and Undeads meet each other for final
          deathmatches where the strongest wins.
          <br />
          <br />
          Each of the skills is crucial for the deathmatches. Train your
          Dexterity to have more successfull attacks, Agility to avoid the hits,
          or Intelligence - to cause critical damage.
        </p>

        <ul className="tokenrage-features">
          <li>
            <img
              srcSet="/assets/connect-icon@2x.png 2x"
              src="/assets/connect-icon.png"
            />
            <span>Connect your crypto wallet</span>
          </li>
          <li>
            <img
              srcSet="/assets/mint-icon@2x.png 2x"
              src="/assets/mint-icon.png"
            />
            <span>Mint your first NFT hero</span>
          </li>
          <li>
            <img
              srcSet="/assets/train-icon@2x.png 2x"
              src="/assets/train-icon.png"
            />
            <span>Train your hero</span>
          </li>
          <li>
            <img
              srcSet="/assets/deathmatch-icon@2x.png 2x"
              src="/assets/deathmatch-icon.png"
            />
            <span>Engage into deathmatches</span>
          </li>
        </ul>

        <div className="connect-button-container" onClick={connect}>
          <img
            srcSet="/assets/continue-with-metamask-button@2x.png 2x"
            src="/assets/continue-with-metamask-button.png"
          />
        </div>
      </div>
    </main>
  );
}
