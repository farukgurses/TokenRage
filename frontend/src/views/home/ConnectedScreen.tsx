import React, { useContext, useEffect, useState } from "react";

import { ethers } from "ethers";
import config from "../../config";
import nftContractABI from "../../artifacts/NFT.json";
import { FighterCard } from "../../components/FighterCard";
import { AppContext } from "../../context/state";
import Web3Modal from "web3modal";
import Loading from "../../components/Loading";

export default function ConnectedScreen() {
  const { loading, setLoading } = useContext(AppContext);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    setLoading(true);
    loadNFTs();
  }, []);
  async function loadNFTs() {
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
    console.log(data);
    setTokens(data);
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
      await transaction.wait();
      await loadNFTs();
    } catch (error) {
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
