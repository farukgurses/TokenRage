import React, { Suspense } from "react";
import ConnectedScreen from "./ConnectedScreen";
import WelcomeScreen from "./WelcomeScreen";
import { WalletProvider } from "ethereal-react";

export default function Home() {
  return <ConnectedScreen />;
}
