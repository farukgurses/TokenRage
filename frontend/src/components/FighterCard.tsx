import {
  useContract,
  useReadContract,
  useWaitForTransaction,
  useWriteContract,
} from "ethereal-react";
import React from "react";
import "./FighterCard.css";
import config from "../config";
import nftContractABI from "../artifacts/NFT.json";
export const FighterCard = ({
  tokenID,
  status,
}: {
  tokenID: number;
  status: "ready" | "minting";
}) => {
  const nftContract = useContract(config.NFT_CONTRACT, nftContractABI);
  const [finishMint, { loading, data }] = useWriteContract(
    nftContract,
    "finishMint"
  );

  if (data) {
    useWaitForTransaction(data);
  }

  if (status === "minting") {
    return (
      <div className="fighter-card">
        minting in progress
        <button onClick={() => finishMint(tokenID)}>Finish Minting</button>
      </div>
    );
  }
  const tokenURI = useReadContract(nftContract, "tokenURI", tokenID);

  const base64ToString = Buffer.from(
    tokenURI.split(",")[1],
    "base64"
  ).toString();
  const obj = JSON.parse(base64ToString) as any;

  return (
    <div className="fighter-card">
      <img src={obj.image} />
    </div>
  );
};
