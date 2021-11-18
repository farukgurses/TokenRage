import React, { useEffect, useState } from "react";
import "./FighterCard.css";
import config from "../config";
import nftContractABI from "../artifacts/NFT.json";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Loading from "./Loading";
export const FighterCard = ({ tokenID }: { tokenID: number }) => {
  const [url, setUrl] = useState("");
  const [cardLoading, setcardLoading] = useState(true);
  const [tokenState, setTokenState] = useState("pending");
  useEffect(() => {
    loadNFT();
  }, []);
  async function loadNFT() {
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
      const data = await contract.tokenURI(tokenID);
      const base64ToString = Buffer.from(
        data.split(",")[1],
        "base64"
      ).toString();
      const obj = JSON.parse(base64ToString) as any;
      setUrl(obj.image);
    } catch (error) {
      console.log(error);
      setUrl(
        "https://st.depositphotos.com/2885805/3842/v/600/depositphotos_38422667-stock-illustration-coming-soon-message-illuminated-with.jpg"
      );
    }

    setcardLoading(false);
  }

  return (
    <div className="fighter-card">
      {cardLoading ? <Loading /> : <img src={url} />}
    </div>
  );
};
