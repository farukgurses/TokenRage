import React, { Suspense } from "react";
import ConnectedScreen from "./ConnectedScreen";
import WelcomeScreen from "./WelcomeScreen";
import { WalletProvider } from "ethereal-react";
import Loading from "../../components/Loading";

export default function Home() {
  return (
    <WalletProvider fallback={<WelcomeScreen />} cacheProvider>
      <Suspense fallback={<Loading />}>
        <ConnectedScreen />
      </Suspense>
    </WalletProvider>
  );
}
