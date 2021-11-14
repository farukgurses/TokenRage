import React from "react";
import { useContract, useReadContract } from "ethereal-react";
import config from "../../config";
import nftContractABI from "../../artifacts/NFT.json";

export default function ConnectedScreen() {
  const nftContract = useContract(config.NFT_CONTRACT, nftContractABI);
  const totalSupply = useReadContract(nftContract, "totalSupply");
  console.log(totalSupply);
  return (
    <main className="main-container welcome-container">
      <img src="/assets/logo.png" className="tokenrage-logo" />
    </main>
  );
}
