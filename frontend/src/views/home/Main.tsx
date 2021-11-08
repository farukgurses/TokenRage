import React from "react";
import ConnectedScreen from "./ConnectedScreen";
import WelcomeScreen from "./WelcomeScreen";
import { WalletProvider } from "ethereal-react";

export default function Home() {
  return (
    <WalletProvider fallback={<WelcomeScreen />} cacheProvider>
      <ConnectedScreen />
    </WalletProvider>
  );
}
