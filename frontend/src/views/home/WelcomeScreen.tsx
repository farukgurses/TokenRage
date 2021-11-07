import { message } from "antd";
import React, { useEffect } from "react";
import { useConnectToWallet } from "ethereal-react";

export default function WelcomeScreen() {
  const [connect, { error }] = useConnectToWallet();

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet", error);
      message.error(
        "Unable to connect to the wallet. Make sure MetaMask extension is installed/activated in your browser or refresh the page and try again.",
        0
      );
    }
  }, [error]);

  return (
    <main className="main-container welcome-container">
      <img
        srcSet="/assets/logo@2x.png 2x"
        src="/assets/logo.png"
        className="tokenrage-logo"
      />

      <div className="welcome-text-content">
        <div className="tokenrage-textlogo">
          <img
            srcSet="/assets/tokenrage-text-logo@2x.png 2x"
            src="/assets/tokenrage-text-logo.png"
          />
        </div>

        <p className="about-tokenrage">
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts. Separated they
          live in Bookmarksgrove right at the coast of the Semantics, a large
          language ocean. A small river named Duden flows by their place and
          supplies it with the necessary regelialia. It is a paradisematic
          country, in which roasted parts (this is a dummy text)
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
            <span>Mint your first NFT character</span>
          </li>
          <li>
            <img
              srcSet="/assets/train-icon@2x.png 2x"
              src="/assets/train-icon.png"
            />
            <span>Train your character</span>
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
