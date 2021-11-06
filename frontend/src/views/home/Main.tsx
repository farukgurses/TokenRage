import React, { useEffect } from "react";
import { useMetamask } from "use-metamask";
import ConnectedScreen from "./ConnectedScreen";
import WelcomeScreen from "./WelcomeScreen";

export default function Home() {
  const { metaState, getAccounts } = useMetamask();

  useEffect(() => {
    if (metaState.isAvailable) {
      (async () => {
        try {
          // this way we can check whether a wallet is already connected
          await getAccounts();
        } catch (e) {
          console.log("Error while getting accounts", e);
        }
      })();
    }
  }, []);

  if (metaState.isConnected) {
    return <ConnectedScreen />;
  }

  return <WelcomeScreen />;
}
