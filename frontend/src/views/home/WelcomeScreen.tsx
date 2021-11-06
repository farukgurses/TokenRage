import { message } from 'antd'
import React from 'react'
import { useMetamask } from 'use-metamask'
import Web3 from 'web3'

export default function WelcomeScreen() {
  const { connect, metaState } = useMetamask()

  const connectMetamask = async () => {
    try {
      await connect(Web3)
    } catch (error) {
      console.error('Error while connecting wallet', error)
      message.error('Unable to connect to the wallet. Refresh the page and try again.');
    }
  }
  
  return (
    <main className="main-container welcome-container">
      <img src="/assets/logo.png" className="tokenrage-logo" />

      <div className="welcome-text-content">
        <div className="tokenrage-textlogo">
          <img src="/assets/tokenrage-text-logo.png" />
        </div>

        <p className="about-tokenrage">
          Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts (this is a dummy text)
        </p>

        <ul className="tokenrage-features">
          <li>
            <img src="/assets/connect-icon.png" />
            <span>Connect your crypto wallet</span>
          </li>
          <li>
            <img src="/assets/mint-icon.png" />
            <span>Mint your first NFT character</span>
          </li>
          <li>
            <img src="/assets/train-icon.png" />
            <span>Train your character</span>
          </li>
          <li>
            <img src="/assets/deathmatch-icon.png" />
            <span>Engage into deathmatches</span>
          </li>
        </ul>

        <div className="connect-button-container" onClick={connectMetamask}>
          <img src="/assets/continue-with-metamask-button.png" />
        </div>
      </div>
    </main>
  )
}