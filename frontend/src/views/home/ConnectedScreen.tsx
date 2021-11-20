import React, { useContext, useEffect, useState } from "react";

import { ethers } from "ethers";
import config from "../../config";
import nftContractABI from "../../artifacts/NFT.json";
import { FighterCard } from "../../components/FighterCard";
import { AppContext } from "../../context/state";
import Web3Modal from "web3modal";
import Loading from "../../components/Loading";
import { message } from "antd";
import { sleep } from "../../utils";

export default function ConnectedScreen() {
  const { loading, setLoading } = useContext(AppContext);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    setLoading(true);
    loadNFTs();
  }, []);
  async function loadNFTs() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        config.NFT_CONTRACT,
        nftContractABI,
        signer
      );
      const firstAccount = (await provider.listAccounts())[0];
      const data = await contract.tokensOfOwner(firstAccount);
      setTokens(data);
    } catch (error) {
      setLoading(true);
      message.info("Your token is getting minted please be patient", 2);
      await sleep(30000);
      await loadNFTs();
      setLoading(false);
    }

    setLoading(false);
  }

  async function mintNFT() {
    setLoading(true);
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        config.NFT_CONTRACT,
        nftContractABI,
        signer
      );
      const price = ethers.utils.parseUnits("0.01", "ether");
      const transaction = await contract.create({ value: price });
      message.info(
        "Your token is getting created, this will take some time",
        2
      );
      await transaction.wait();
      await loadNFTs();
    } catch (error: any) {
      message.error(error.message, 2);
      setLoading(false);
    }

    setLoading(false);
  }

  if (loading) {
    return <Loading />;
  }
  return (
    <main className="main-container">
      <img
        srcSet="/assets/logo@2x.png 2x"
        src="/assets/logo.png"
        className="tokenrage-logo"
      />
      <div className="my-wallet-container">
        {tokens.map((tokenID: number, i: number) => (
          <FighterCard tokenID={tokenID} key={i} />
        ))}
      </div>
      <button onClick={mintNFT}>mint</button>
    </main>
  );
}
