import React, { useEffect } from "react";
import "../../node_modules/antd/dist/antd.dark.css";

import Web3Modal from "web3modal";
import { Menu, Dropdown } from "antd";

export default function Header(): JSX.Element {
  const [walletAddress, setWalletAddress] = React.useState("");

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
      <img
        srcSet="/assets/logo@2x.png 2x"
        src="/assets/logo.png"
        className="tokenrage-logo"
      />
      <div className="tokenrage-text-logo"></div>
      <Dropdown overlay={menu}>
        <div className="tokenrage-settings-icon"></div>
      </Dropdown>
    </header>
  );
}
