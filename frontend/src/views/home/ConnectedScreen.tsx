import React, { Suspense, useState } from "react";
import {
  useContract,
  useReadContract,
  useUserAddress,
  useWaitForTransaction,
  useWriteContract,
} from "ethereal-react";
import { ethers } from "ethers";
import config from "../../config";
import nftContractABI from "../../artifacts/NFT.json";
import { FighterCard } from "../../components/FighterCard";
export default function ConnectedScreen() {
  const nftContract = useContract(config.NFT_CONTRACT, nftContractABI);
  const address = useUserAddress();
  const walletOfOwner = useReadContract(nftContract, "tokensOfOwner", address);
  console.log(walletOfOwner);
  const [createNFT, { loading, data }] = useWriteContract(
    nftContract,
    "create"
  );

  if (data) {
    useWaitForTransaction(data);
    console.log(data);
  }
  function mintNFT() {
    const price = ethers.utils.parseUnits("0.01", "ether");
    createNFT({ value: price });
  }
  return (
    <main className="main-container">
      <img
        srcSet="/assets/logo@2x.png 2x"
        src="/assets/logo.png"
        className="tokenrage-logo"
      />

      <div className="my-wallet-container">
        {walletOfOwner.map((tokenID: number, i: number) => (
          <Suspense
            fallback={<FighterCard tokenID={tokenID} status="minting" />}
            key={i}
          >
            <FighterCard tokenID={tokenID} status="ready" />
          </Suspense>
        ))}
      </div>
      <button onClick={mintNFT}>mint</button>
    </main>
  );
}
