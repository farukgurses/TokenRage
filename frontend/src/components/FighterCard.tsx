import React, { useEffect, useState } from "react";
import "./FighterStyles.css";
import config from "../config";
import nftContractABI from "../artifacts/NFT.json";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { Link } from "react-router-dom";
import { genRandomName, sleep } from "../utils/";
import { message } from "antd";
import FighterImage from "./FighterImage";

export const FighterCard = ({
  tokenID,
  showName = true,
}: {
  showName?: boolean;
  tokenID: number;
}): JSX.Element => {
  const [fighter, setFighter] = useState({
    name: "",
    attributes: [{ value: "" }],
    image: "",
  });
  const [cardLoading, setcardLoading] = useState(true);
  const [tokenState, setTokenState] = useState("");
  useEffect(() => {
    loadNFT();
  }, []);
  async function loadNFT() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      config.NFT_CONTRACT,
      nftContractABI,
      signer
    );
    try {
      const data = await contract.tokenURI(tokenID);
      if (data === "") {
        setTokenState("pending");
      } else {
        setTokenState("ready");
      }
      const base64ToString = Buffer.from(
        data.split(",")[1],
        "base64"
      ).toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fighterData = JSON.parse(base64ToString) as any;
      setFighter(fighterData);
    } catch (error) {
      setcardLoading(false);
    }

    setcardLoading(false);
  }

  async function finishMint() {
    setcardLoading(true);
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
      await contract.finishMint(tokenID, genRandomName());
      await sleep(20000);
      await loadNFT();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.message, 2);
    }
    setcardLoading(false);
  }

  if (tokenState === "pending" || cardLoading || !fighter) {
    return (
      <div className="fighter-card inverted" onClick={finishMint}>
        <div className="finish-minting-button fighter-image-container"></div>
      </div>
    );
  }

  return (
    <div className="fighter-card">
      <Link to={`/hero/${tokenID}`}>
        <FighterImage fighter={fighter} showName={showName} />
      </Link>
    </div>
  );
};
