import React from "react";
import { Alert, Button } from "antd";
import { useMetamask } from "use-metamask";
import Web3 from "web3";

export default function ConnectedScreen() {
  const { connect, metaState } = useMetamask();

  if (!metaState.isConnected) {
    return (
      <Alert
        message="MetaMask is not connected"
        type="error"
        action={
          <Button
            size="small"
            type="text"
            onClick={async () => {
              await connect(Web3);
            }}
          >
            Connect
          </Button>
        }
      />
    );
  }

  return (
    <main className="main-container welcome-container">
      <img src="/assets/logo.png" className="tokenrage-logo" />
    </main>
  );
}
