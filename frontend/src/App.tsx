import React, { Suspense } from "react";
import { Provider as ReduxProvider } from "react-redux";
import Home from "./views/home/Main";
import store from "./redux/store";
import Hero from "./views/hero/HeroScreen";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { WalletProvider } from "ethereal-react";
import WelcomeScreen from "./views/home/WelcomeScreen";

function App() {
  return (
    <div className="App">
      <ReduxProvider store={store}>
        <WalletProvider fallback={<WelcomeScreen />} cacheProvider>
          <Suspense fallback={<>LOADING...</>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hero/:id" element={<Hero />} />
            </Routes>
          </Suspense>
        </WalletProvider>
      </ReduxProvider>
    </div>
  );
}

export default App;
