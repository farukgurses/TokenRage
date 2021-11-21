import React, { useContext, useEffect, useState } from "react";
import "../../node_modules/antd/dist/antd.dark.css";

import Web3Modal from "web3modal";
import { AppContext } from "../context/state";
import { Menu, Dropdown } from "antd";
import Loading from "./Loading";
import { Link } from "react-router-dom";

export default function Header({
  onLogoPress = null,
}: {
  onLogoPress?: null | (() => void);
}): JSX.Element {
  const [walletAddress, setWalletAddress] = React.useState("");

  const { loading, setLoading } = useContext(AppContext);

  useEffect(() => {
    (async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      setWalletAddress(connection.selectedAddress);
    })();
  }, []);

  const menu = (
    <Menu>
      <Menu.Item disabled>Connected as {walletAddress}</Menu.Item>
      <Menu.Item danger onClick={() => null}>
        Disconnect Wallet
      </Menu.Item>
    </Menu>
  );

  return (
    <header>
      <Link
        to="/"
        onClick={onLogoPress ? onLogoPress : () => null}
        title={onLogoPress ? "Reload NFTs" : "Navigate home"}
      >
        <img
          srcSet="/assets/logo@2x.png 2x"
          src="/assets/logo.png"
          className="tokenrage-logo"
        />
      </Link>
      <div className="tokenrage-text-logo"></div>
      <Dropdown overlay={menu}>
        <div className="tokenrage-settings-icon"></div>
      </Dropdown>
      {loading && (
        <div
          className="global-loading-indicator"
          title="Loading in progress..."
        >
          <Loading />
        </div>
      )}
    </header>
  );
}
