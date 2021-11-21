import { message, Modal } from "antd";
import React, { useContext, useState } from "react";
import { HiPencilAlt } from "react-icons/hi";
import { Input } from "antd";
import { AppContext } from "../context/state";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import config from "../config";
import trainingContractABI from "../artifacts/Training.json";
import { sleep } from "../utils";
import Loading from "./Loading";
export const FighterName = ({
  name,
  tokenId,
  loadNFT,
}: {
  name: string;
  tokenId?: string;
  loadNFT: any;
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [heroName, setheroName] = useState(name);
  const { loading, setLoading } = useContext(AppContext);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    setLoading(true);

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const trainingContract = new ethers.Contract(
        config.TRAINING_CONTRACT,
        trainingContractABI,
        signer
      );
      const transaction = await trainingContract.renameHero(tokenId, heroName);
      await transaction.wait();
      await sleep(5000);
      await loadNFT();
    } catch (error: any) {
      if (error.data.message) {
        message.error(error.data.message, 2);
      } else {
        message.error(error.message, 2);
      }
    }
    setIsModalVisible(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <h1 className="fighter-name">
        {name}{" "}
        <HiPencilAlt
          cursor="pointer"
          size={25}
          color="2e2f36"
          onClick={showModal}
        />
      </h1>
      <Modal
        title="Rename your hero"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input value={heroName} onChange={(e) => setheroName(e.target.value)} />
      </Modal>
    </div>
  );
};
